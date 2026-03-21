const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');
const Employer = require('../src/models/Employer.model');
const Admin = require('../src/models/Admin.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');
const Interaction = require('../src/models/Interaction.model');
const Report = require('../src/models/Report.model');

function toIdSet(docs = []) {
  return new Set(docs.map((x) => String(x._id)));
}

function hasId(idSet, value) {
  return value ? idSet.has(String(value)) : false;
}

function existsByModel(modelName, id, sets) {
  if (!id) return false;

  switch (modelName) {
    case 'Student':
      return hasId(sets.studentIdSet, id);
    case 'Employer':
      return hasId(sets.employerIdSet, id);
    case 'Admin':
      return hasId(sets.adminIdSet, id);
    case 'Job':
      return hasId(sets.jobIdSet, id);
    case 'Application':
      return hasId(sets.applicationIdSet, id);
    default:
      return false;
  }
}

async function cleanupOrphanApplications() {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const [students, employers, admins, jobs] = await Promise.all([
    Student.find({}).select('_id'),
    Employer.find({}).select('_id'),
    Admin.find({}).select('_id'),
    Job.find({}).select('_id'),
  ]);

  const studentIdSet = toIdSet(students);
  const employerIdSet = toIdSet(employers);
  const adminIdSet = toIdSet(admins);
  const jobIdSet = toIdSet(jobs);

  const applications = await Application.find({}).select('_id student employer job');
  const applicationIdSet = toIdSet(applications);

  const brokenApplications = applications.filter((app) => {
    const studentOk = hasId(studentIdSet, app.student);
    const employerOk = hasId(employerIdSet, app.employer);
    const jobOk = hasId(jobIdSet, app.job);
    return !studentOk || !employerOk || !jobOk;
  });

  const brokenApplicationIds = brokenApplications.map((x) => x._id);
  const brokenApplicationIdSet = new Set(brokenApplicationIds.map((x) => String(x)));

  if (brokenApplicationIds.length) {
    await Application.deleteMany({
      _id: { $in: brokenApplicationIds },
    });
  }

  for (const id of brokenApplicationIdSet) {
    applicationIdSet.delete(id);
  }

  const interactions = await Interaction.find({}).select('_id student job interactionType metadata');

  const brokenInteractions = interactions.filter((it) => {
    const studentOk = hasId(studentIdSet, it.student);
    const jobOk = hasId(jobIdSet, it.job);

    const applicationId = it.metadata?.applicationId
      ? String(it.metadata.applicationId)
      : null;

    const brokenByMissingRefs = !studentOk || !jobOk;

    const brokenByApplicationLink =
      it.interactionType === 'apply' &&
      applicationId &&
      (!applicationIdSet.has(applicationId) || brokenApplicationIdSet.has(applicationId));

    return brokenByMissingRefs || brokenByApplicationLink;
  });

  const brokenInteractionIds = brokenInteractions.map((x) => x._id);

  if (brokenInteractionIds.length) {
    await Interaction.deleteMany({
      _id: { $in: brokenInteractionIds },
    });
  }

  await Job.updateMany({}, { $set: { applicationsCount: 0 } });

  const grouped = await Application.aggregate([
    {
      $group: {
        _id: '$job',
        count: { $sum: 1 },
      },
    },
  ]);

  if (grouped.length) {
    await Job.bulkWrite(
      grouped.map((item) => ({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: { applicationsCount: item.count } },
        },
      }))
    );
  }

  const reportSets = {
    studentIdSet,
    employerIdSet,
    adminIdSet,
    jobIdSet,
    applicationIdSet,
  };

  const reports = await Report.find({})
    .select(
      '_id reporterId reporterModel targetId targetModel relatedJob relatedApplication handledBy handledAt'
    )
    .lean();

  const brokenReports = [];
  const reportFixOps = [];

  for (const report of reports) {
    const reporterOk = existsByModel(report.reporterModel, report.reporterId, reportSets);
    const targetOk = existsByModel(report.targetModel, report.targetId, reportSets);

    if (!reporterOk || !targetOk) {
      brokenReports.push(report._id);
      continue;
    }

    const update = {};

    if (report.relatedJob && !hasId(jobIdSet, report.relatedJob)) {
      update.relatedJob = null;
    }

    if (report.relatedApplication && !hasId(applicationIdSet, report.relatedApplication)) {
      update.relatedApplication = null;
    }

    if (report.handledBy && !hasId(adminIdSet, report.handledBy)) {
      update.handledBy = null;
      update.handledAt = null;
    }

    if (Object.keys(update).length > 0) {
      reportFixOps.push({
        updateOne: {
          filter: { _id: report._id },
          update: { $set: update },
        },
      });
    }
  }

  if (brokenReports.length) {
    await Report.deleteMany({
      _id: { $in: brokenReports },
    });
  }

  if (reportFixOps.length) {
    await Report.bulkWrite(reportFixOps, { ordered: false });
  }

  console.log(`🧹 Đã xoá ${brokenApplications.length} application mồ côi`);
  console.log(`🧹 Đã xoá ${brokenInteractions.length} interaction mồ côi`);
  console.log(`🧹 Đã xoá ${brokenReports.length} report lỗi/mồ côi`);
  console.log(`🔧 Đã sửa ${reportFixOps.length} report bị đứt liên kết phụ`);
  console.log('🔄 Đã đồng bộ lại applicationsCount');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

cleanupOrphanApplications().catch(async (err) => {
  console.error('❌ Lỗi cleanup orphan applications:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});