const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');
const Employer = require('../src/models/Employer.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');
const Interaction = require('../src/models/Interaction.model');

async function cleanupOrphanApplications() {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const [students, employers, jobs] = await Promise.all([
    Student.find({}).select('_id'),
    Employer.find({}).select('_id'),
    Job.find({}).select('_id'),
  ]);

  const studentIdSet = new Set(students.map((x) => String(x._id)));
  const employerIdSet = new Set(employers.map((x) => String(x._id)));
  const jobIdSet = new Set(jobs.map((x) => String(x._id)));

  const applications = await Application.find({}).select('_id student employer job');

  const brokenApplications = applications.filter((app) => {
    const studentOk = studentIdSet.has(String(app.student));
    const employerOk = employerIdSet.has(String(app.employer));
    const jobOk = jobIdSet.has(String(app.job));
    return !studentOk || !employerOk || !jobOk;
  });

  const brokenApplicationIds = brokenApplications.map((x) => x._id);

  if (brokenApplicationIds.length) {
    await Application.deleteMany({
      _id: { $in: brokenApplicationIds },
    });
  }

  const interactions = await Interaction.find({}).select('_id student job interactionType metadata');

  const brokenInteractions = interactions.filter((it) => {
    const studentOk = studentIdSet.has(String(it.student));
    const jobOk = jobIdSet.has(String(it.job));

    const brokenByMissingRefs = !studentOk || !jobOk;
    const brokenByDeletedApplication =
      it.interactionType === 'apply' &&
      it.metadata?.applicationId &&
      brokenApplicationIds.some((id) => String(id) === String(it.metadata.applicationId));

    return brokenByMissingRefs || brokenByDeletedApplication;
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

  console.log(`🧹 Đã xoá ${brokenApplications.length} application mồ côi`);
  console.log(`🧹 Đã xoá ${brokenInteractions.length} interaction mồ côi`);
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