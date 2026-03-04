const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');
const Interaction = require('../src/models/Interaction.model');

const SEED_STUDENT_EMAILS = [
  'student1@gmail.com',
  'student2@gmail.com',
  'student3@gmail.com',
  'student4@gmail.com',
  'student5@gmail.com',
  'student6@gmail.com',
  'student7@gmail.com',
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeText(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function uniqueNormalized(arr = []) {
  return [...new Set((arr || []).map((x) => normalizeText(x)).filter(Boolean))];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset');

  const countArg = args.find((a) => a.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : 42;

  return {
    reset,
    count: Number.isFinite(count) ? count : 42,
  };
}

function scoreStudentJobAffinity(student, job) {
  let score = 0;

  const studentSkills = uniqueNormalized([
    ...(student.skills || []),
    ...(student.projectTechnologies || []),
  ]);
  const studentCategories = uniqueNormalized(student.preferredCategories || []);
  const studentLocations = uniqueNormalized(student.preferredLocations || []);
  const studentJobTypes = uniqueNormalized(student.preferredJobTypes || []);
  const studentWorkModes = uniqueNormalized(student.preferredWorkModes || []);
  const desiredTitles = uniqueNormalized(student.desiredJobTitles || []);
  const studentMajor = normalizeText(student.major || '');

  const jobRequiredSkills = uniqueNormalized(
    job.requiredSkills?.length ? job.requiredSkills : job.skills || []
  );
  const jobPreferredSkills = uniqueNormalized(job.preferredSkills || []);
  const jobCategories = uniqueNormalized(job.categories || []);
  const jobMajors = uniqueNormalized(job.acceptableMajors || []);
  const jobCity = normalizeText(job.location?.city || '');
  const jobType = normalizeText(job.jobType || '');
  const workMode = normalizeText(job.workMode || '');
  const jobTitle = normalizeText(job.title || '');

  const matchedRequired = jobRequiredSkills.filter((s) => studentSkills.includes(s));
  const matchedPreferred = jobPreferredSkills.filter((s) => studentSkills.includes(s));
  const matchedCategories = jobCategories.filter((c) => studentCategories.includes(c));

  score += matchedRequired.length * 7;
  score += matchedPreferred.length * 3;
  score += matchedCategories.length * 5;

  if (studentLocations.includes(jobCity)) score += 5;
  if (studentJobTypes.includes(jobType)) score += 5;
  if (studentWorkModes.includes(workMode)) score += 3;
  if (studentMajor && jobMajors.includes(studentMajor)) score += 6;

  if (desiredTitles.some((t) => t && jobTitle.includes(t))) score += 8;
  else if (
    desiredTitles.some((t) =>
      t.split(' ').some((token) => token && token.length >= 3 && jobTitle.includes(token))
    )
  ) {
    score += 4;
  }

  // sinh viên chưa nhiều kỹ năng vẫn nên có khả năng apply vào job student-friendly
  const level = normalizeText(job.level || '');
  if (['intern', 'fresher'].includes(level)) score += 2;

  // tránh zero-probability
  score += 1;

  return score;
}

function pickWeightedJob(student, jobs, excludeJobIds = new Set()) {
  const available = jobs.filter((j) => !excludeJobIds.has(String(j._id)));
  if (!available.length) return null;

  const weighted = available.map((job) => ({
    job,
    weight: scoreStudentJobAffinity(student, job),
  }));

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);

  let threshold = Math.random() * totalWeight;
  for (const item of weighted) {
    threshold -= item.weight;
    if (threshold <= 0) return item.job;
  }

  return weighted[weighted.length - 1].job;
}

function pickApplicationStatus(affinityScore) {
  // job càng hợp thì càng dễ có status tích cực
  const r = Math.random();

  if (affinityScore >= 22) {
    if (r < 0.45) return 'pending';
    if (r < 0.78) return 'reviewing';
    if (r < 0.93) return 'accepted';
    if (r < 0.98) return 'rejected';
    return 'withdrawn';
  }

  if (affinityScore >= 12) {
    if (r < 0.42) return 'pending';
    if (r < 0.72) return 'reviewing';
    if (r < 0.84) return 'accepted';
    if (r < 0.94) return 'rejected';
    return 'withdrawn';
  }

  if (r < 0.28) return 'pending';
  if (r < 0.48) return 'reviewing';
  if (r < 0.58) return 'accepted';
  if (r < 0.83) return 'rejected';
  return 'withdrawn';
}

function buildExpectedSalary(student) {
  const min = Number(student.salaryExpectation?.min || 0);
  const max = Number(student.salaryExpectation?.max || 0);

  if (min > 0 && max > min) {
    return randomInt(min, max);
  }

  return randomInt(3000000, 12000000);
}

async function seedApplications({ reset, count }) {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const students = await Student.find({
    email: { $in: SEED_STUDENT_EMAILS.map((e) => e.toLowerCase()) },
  }).select(`
    _id email fullName major skills preferredLocations preferredCategories
    preferredJobTypes preferredWorkModes desiredJobTitles projectTechnologies
    salaryExpectation
  `);

  if (!students.length) {
    console.log('⚠️ Không tìm thấy seed students. Hãy chạy seedStudents trước.');
    await mongoose.disconnect();
    return;
  }

  const jobs = await Job.find({
    categories: 'seed-demo',
    status: 'active',
    isVerified: true,
    deadline: { $gte: new Date() },
  }).select(`
    _id title employer jobType level location salary categories requiredSkills
    preferredSkills workMode acceptableMajors status deadline
  `);

  if (!jobs.length) {
    console.log('⚠️ Không tìm thấy seed jobs hợp lệ (seed-demo, active, verified, còn hạn).');
    await mongoose.disconnect();
    return;
  }

  const seedStudentIds = students.map((s) => s._id);

  if (reset) {
    const delApps = await Application.deleteMany({
      student: { $in: seedStudentIds },
    });

    const delInteractions = await Interaction.deleteMany({
      student: { $in: seedStudentIds },
      'metadata.seeded': true,
      'metadata.sourceScript': 'seedApplications',
    });

    console.log(
      `🧹 Reset: deleted applications=${delApps.deletedCount}, interactions=${delInteractions.deletedCount}`
    );
  }

  let createdApps = 0;
  let skippedApps = 0;
  let createdInteractions = 0;

  // mỗi sinh viên nên có một số application hợp lý, tránh dồn vào 1-2 bạn
  const perStudentTarget = Math.max(4, Math.floor(count / students.length));
  const usedPairs = new Set();

  for (const student of students) {
    const usedJobIds = new Set();

    for (let i = 0; i < perStudentTarget; i++) {
      const job = pickWeightedJob(student, jobs, usedJobIds);
      if (!job) {
        skippedApps++;
        continue;
      }

      const pairKey = `${student._id}_${job._id}`;
      if (usedPairs.has(pairKey)) {
        skippedApps++;
        continue;
      }

      const exists = await Application.findOne({
        student: student._id,
        job: job._id,
      }).select('_id');

      if (exists) {
        skippedApps++;
        usedJobIds.add(String(job._id));
        continue;
      }

      usedPairs.add(pairKey);
      usedJobIds.add(String(job._id));

      const affinityScore = scoreStudentJobAffinity(student, job);
      const status = pickApplicationStatus(affinityScore);
      const appliedAt = addDays(new Date(), -randomInt(1, 18));

      const app = await Application.create({
        job: job._id,
        student: student._id,
        employer: job.employer,
        coverLetter: `Em quan tâm đến vị trí "${job.title}" vì khá phù hợp với định hướng hiện tại của em. Em mong muốn được học hỏi thêm qua công việc thực tế.`,
        expectedSalary: buildExpectedSalary(student),
        availableFrom: addDays(new Date(), randomInt(0, 10)),
        additionalInfo: 'Có thể sắp xếp lịch học để làm việc linh hoạt.',
        status,
        appliedAt,
      });

      // chỉ tăng mạnh popularity cho application không tiêu cực
      const positiveStatuses = ['pending', 'reviewing', 'accepted'];
      if (positiveStatuses.includes(status)) {
        await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });
      } else if (status === 'rejected' && Math.random() < 0.35) {
        // rejected vẫn có thể tính nhẹ vì đã từng ứng tuyển
        await Job.updateOne({ _id: job._id }, { $inc: { applicationsCount: 1 } });
      }

      // tạo lịch sử tương tác hợp lý quanh việc apply
      // 1) view
      const viewAt = addDays(appliedAt, -randomInt(1, 4));
      await Interaction.create({
        student: student._id,
        job: job._id,
        interactionType: 'view',
        source: 'web',
        interactionValue: 1,
        metadata: {
          seeded: true,
          sourceScript: 'seedApplications',
          applicationId: app._id.toString(),
        },
        createdAt: viewAt,
        updatedAt: viewAt,
      });
      await Job.updateOne({ _id: job._id }, { $inc: { views: 1 } });
      createdInteractions++;

      // 2) click
      if (Math.random() < 0.9) {
        const clickAt = addDays(appliedAt, -randomInt(0, 2));
        await Interaction.create({
          student: student._id,
          job: job._id,
          interactionType: 'click',
          source: 'web',
          interactionValue: 2,
          metadata: {
            seeded: true,
            sourceScript: 'seedApplications',
            applicationId: app._id.toString(),
          },
          createdAt: clickAt,
          updatedAt: clickAt,
        });
        createdInteractions++;
      }

      // 3) save nếu là app khá hợp và không withdrawn
      if (affinityScore >= 14 && status !== 'withdrawn' && Math.random() < 0.75) {
        const saveAt = addDays(appliedAt, -randomInt(0, 1));
        await Interaction.create({
          student: student._id,
          job: job._id,
          interactionType: 'save',
          source: 'manual',
          interactionValue: 3,
          metadata: {
            seeded: true,
            sourceScript: 'seedApplications',
            applicationId: app._id.toString(),
          },
          createdAt: saveAt,
          updatedAt: saveAt,
        });
        createdInteractions++;
      }

      // 4) apply interaction
      // rejected/withdrawn không nên mạnh như pending/reviewing/accepted
      const applyValue =
        status === 'accepted' ? 5 :
        status === 'pending' || status === 'reviewing' ? 4 :
        status === 'rejected' ? 2 :
        1;

      await Interaction.create({
        student: student._id,
        job: job._id,
        interactionType: 'apply',
        source: 'web',
        interactionValue: applyValue,
        metadata: {
          applicationId: app._id.toString(),
          seeded: true,
          sourceScript: 'seedApplications',
          applicationStatus: status,
        },
        createdAt: appliedAt,
        updatedAt: appliedAt,
      });
      createdInteractions++;

      // 5) nếu withdrawn thì thêm unsave nhẹ để phản ánh negative signal
      if (status === 'withdrawn' && Math.random() < 0.8) {
        const unsaveAt = addDays(appliedAt, randomInt(1, 3));
        await Interaction.create({
          student: student._id,
          job: job._id,
          interactionType: 'unsave',
          source: 'manual',
          interactionValue: 1,
          metadata: {
            seeded: true,
            sourceScript: 'seedApplications',
            applicationId: app._id.toString(),
            applicationStatus: status,
          },
          createdAt: unsaveAt,
          updatedAt: unsaveAt,
        });
        createdInteractions++;
      }

      createdApps++;
    }
  }

  console.log(`🎉 Seed Applications: created=${createdApps}, skipped=${skippedApps}`);
  console.log(`🎯 Seed interactions from applications: created=${createdInteractions}`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { reset, count } = parseArgs();

seedApplications({ reset, count }).catch(async (err) => {
  console.error('❌ Lỗi seed applications:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});