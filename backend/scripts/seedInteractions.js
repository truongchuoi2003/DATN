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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr = []) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    reset: args.includes('--reset'),
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
  const level = normalizeText(job.level || '');

  const matchedRequired = jobRequiredSkills.filter((s) => studentSkills.includes(s));
  const matchedPreferred = jobPreferredSkills.filter((s) => studentSkills.includes(s));
  const matchedCategories = jobCategories.filter((c) => studentCategories.includes(c));

  score += matchedRequired.length * 7;
  score += matchedPreferred.length * 3;
  score += matchedCategories.length * 5;

  if (studentMajor && jobMajors.includes(studentMajor)) score += 6;
  if (studentLocations.includes(jobCity)) score += 5;
  if (studentJobTypes.includes(jobType)) score += 5;
  if (studentWorkModes.includes(workMode)) score += 3;

  if (desiredTitles.some((t) => t && jobTitle.includes(t))) {
    score += 8;
  } else if (
    desiredTitles.some((t) =>
      t.split(' ').some((token) => token && token.length >= 3 && jobTitle.includes(token))
    )
  ) {
    score += 4;
  }

  if (['intern', 'fresher'].includes(level)) score += 2;

  score += 1;
  return score;
}

function pickUniqueJobs(sortedItems, count, excludeIds = new Set()) {
  const picked = [];

  for (const item of sortedItems) {
    const id = String(item.job._id);
    if (excludeIds.has(id)) continue;
    picked.push(item);
    excludeIds.add(id);
    if (picked.length >= count) break;
  }

  return picked;
}

function buildStudentInteractionPlan(student, jobs) {
  const scored = jobs
    .map((job) => ({ job, score: scoreStudentJobAffinity(student, job) }))
    .sort((a, b) => b.score - a.score);

  const used = new Set();

  const strongPool = scored.filter((x) => x.score >= 22);
  const mediumPool = scored.filter((x) => x.score >= 13 && x.score < 22);
  const weakPool = scored.filter((x) => x.score < 13);

  const strong = pickUniqueJobs(strongPool, 4, used);
  const medium = pickUniqueJobs(mediumPool, 3, used);

  let weak = pickUniqueJobs(weakPool, 2, used);
  if (weak.length < 2) {
    const fallbackWeak = pickUniqueJobs([...scored].reverse(), 2 - weak.length, used);
    weak = [...weak, ...fallbackWeak];
  }

  return { strong, medium, weak };
}

function buildTimeline() {
  const today = new Date();
  return {
    old: addDays(today, -randomInt(12, 18)),
    mid: addDays(today, -randomInt(6, 11)),
    recent: addDays(today, -randomInt(2, 5)),
    latest: addDays(today, -randomInt(0, 2)),
  };
}

function makeInteraction({
  studentId,
  jobId,
  type,
  source = 'web',
  value,
  createdAt,
  metadata = {},
}) {
  return {
    student: studentId,
    job: jobId,
    interactionType: type,
    source,
    interactionValue: value,
    metadata: {
      seeded: true,
      sourceScript: 'seedInteractions',
      ...metadata,
    },
    createdAt,
    updatedAt: createdAt,
  };
}

function buildInteractionsForJob(student, scoredJob, bucket) {
  const studentId = student._id;
  const jobId = scoredJob.job._id;
  const score = scoredJob.score;
  const t = buildTimeline();
  const docs = [];
  let viewCount = 0;

  if (bucket === 'strong') {
    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'view',
        value: 1,
        createdAt: t.old,
        metadata: { bucket, affinityScore: score },
      })
    );
    viewCount += 1;

    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'click',
        value: 2,
        createdAt: t.mid,
        metadata: { bucket, affinityScore: score },
      })
    );

    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'save',
        source: 'manual',
        value: 3,
        createdAt: t.recent,
        metadata: { bucket, affinityScore: score },
      })
    );

    if (Math.random() < 0.8) {
      docs.push(
        makeInteraction({
          studentId,
          jobId,
          type: 'view',
          value: 1,
          createdAt: t.latest,
          metadata: { bucket, affinityScore: score, revisit: true },
        })
      );
      viewCount += 1;
    }

    if (Math.random() < 0.55) {
      docs.push(
        makeInteraction({
          studentId,
          jobId,
          type: 'click',
          value: 2,
          createdAt: addDays(t.latest, 1),
          metadata: { bucket, affinityScore: score, revisit: true },
        })
      );
    }
  }

  if (bucket === 'medium') {
    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'view',
        value: 1,
        createdAt: t.mid,
        metadata: { bucket, affinityScore: score },
      })
    );
    viewCount += 1;

    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'click',
        value: 2,
        createdAt: t.recent,
        metadata: { bucket, affinityScore: score },
      })
    );

    if (score >= 18 && Math.random() < 0.45) {
      docs.push(
        makeInteraction({
          studentId,
          jobId,
          type: 'save',
          source: 'manual',
          value: 3,
          createdAt: t.latest,
          metadata: { bucket, affinityScore: score },
        })
      );
    }
  }

  if (bucket === 'weak') {
    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'view',
        value: 1,
        createdAt: t.mid,
        metadata: { bucket, affinityScore: score },
      })
    );
    viewCount += 1;

    if (Math.random() < 0.75) {
      docs.push(
        makeInteraction({
          studentId,
          jobId,
          type: 'click',
          value: 2,
          createdAt: t.recent,
          metadata: { bucket, affinityScore: score },
        })
      );
    }

    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'save',
        source: 'manual',
        value: 3,
        createdAt: addDays(t.recent, 1),
        metadata: { bucket, affinityScore: score, tempSave: true },
      })
    );

    docs.push(
      makeInteraction({
        studentId,
        jobId,
        type: 'unsave',
        source: 'manual',
        value: 1,
        createdAt: addDays(t.latest, 1),
        metadata: { bucket, affinityScore: score, negativeSignal: true },
      })
    );
  }

  return { docs, viewCount };
}

async function seedInteractions({ reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const students = await Student.find({
    email: { $in: SEED_STUDENT_EMAILS.map((e) => e.toLowerCase()) },
  }).select(`
    _id email fullName major skills preferredLocations preferredCategories
    preferredJobTypes preferredWorkModes desiredJobTitles projectTechnologies
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
    _id title employer jobType level location categories requiredSkills
    preferredSkills skills workMode acceptableMajors views applicationsCount
  `);

  if (!jobs.length) {
    console.log('⚠️ Không tìm thấy seed jobs hợp lệ. Hãy chạy seedJobs trước.');
    await mongoose.disconnect();
    return;
  }

  const studentIds = students.map((s) => s._id);

  if (reset) {
    const delApps = await Application.deleteMany({ student: { $in: studentIds } });
    const delInteractions = await Interaction.deleteMany({ student: { $in: studentIds } });
    const resetJobs = await Job.updateMany(
      { categories: 'seed-demo' },
      { $set: { views: 0, applicationsCount: 0 } }
    );

    console.log(
      `🧹 Reset: applications=${delApps.deletedCount}, interactions=${delInteractions.deletedCount}, jobsReset=${resetJobs.modifiedCount}`
    );
  } else {
    await Application.deleteMany({ student: { $in: studentIds } });
    await Interaction.deleteMany({
      student: { $in: studentIds },
      interactionType: 'apply',
    });
  }

  const interactionDocs = [];
  const viewCountByJob = new Map();

  for (const student of students) {
    const plan = buildStudentInteractionPlan(student, jobs);

    for (const item of plan.strong) {
      const { docs, viewCount } = buildInteractionsForJob(student, item, 'strong');
      interactionDocs.push(...docs);
      viewCountByJob.set(String(item.job._id), (viewCountByJob.get(String(item.job._id)) || 0) + viewCount);
    }

    for (const item of plan.medium) {
      const { docs, viewCount } = buildInteractionsForJob(student, item, 'medium');
      interactionDocs.push(...docs);
      viewCountByJob.set(String(item.job._id), (viewCountByJob.get(String(item.job._id)) || 0) + viewCount);
    }

    for (const item of plan.weak) {
      const { docs, viewCount } = buildInteractionsForJob(student, item, 'weak');
      interactionDocs.push(...docs);
      viewCountByJob.set(String(item.job._id), (viewCountByJob.get(String(item.job._id)) || 0) + viewCount);
    }
  }

  if (interactionDocs.length) {
    await Interaction.insertMany(shuffle(interactionDocs), { ordered: false });
  }

  const bulkOps = [...viewCountByJob.entries()].map(([jobId, views]) => ({
    updateOne: {
      filter: { _id: jobId },
      update: {
        $set: {
          views,
          applicationsCount: 0,
        },
      },
    },
  }));

  if (bulkOps.length) {
    await Job.bulkWrite(bulkOps);
  }

  await Job.updateMany(
    {
      categories: 'seed-demo',
      _id: { $nin: [...viewCountByJob.keys()] },
    },
    {
      $set: {
        views: 0,
        applicationsCount: 0,
      },
    }
  );

  const applyInteractionCount = await Interaction.countDocuments({
    student: { $in: studentIds },
    interactionType: 'apply',
  });

  const applicationCount = await Application.countDocuments({
    student: { $in: studentIds },
  });

  console.log(`🎉 Seed interactions xong: created=${interactionDocs.length}`);
  console.log(`👀 Jobs có view tín hiệu: ${viewCountByJob.size}`);
  console.log(`📭 Applications còn lại của seed students: ${applicationCount}`);
  console.log(`🚫 Apply interactions còn lại của seed students: ${applyInteractionCount}`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { reset } = parseArgs();

seedInteractions({ reset }).catch(async (err) => {
  console.error('❌ Lỗi seed interactions:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});