const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');

const Student = require('../src/models/Student.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');
require('../src/models/Employer.model');
const recommendationController = require('../src/controllers/recommendation.controller');

const SEED_STUDENT_EMAILS = [
  'student1@gmail.com',
  'student2@gmail.com',
  'student3@gmail.com',
  'student4@gmail.com',
  'student5@gmail.com',
  'student6@gmail.com',
  'student7@gmail.com',
];

// =========================
// Helpers
// =========================
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

function intersectCount(a = [], b = []) {
  const setB = new Set(b);
  let count = 0;
  for (const x of a) {
    if (setB.has(x)) count++;
  }
  return count;
}

function ratio(n, d) {
  if (!d || d <= 0) return 0;
  return Math.max(0, Math.min(1, n / d));
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function parseArgs() {
  const args = process.argv.slice(2);

  const topKArg = args.find((a) => a.startsWith('--topk='));
  const topK = topKArg ? Number(topKArg.split('=')[1]) : 10;

  const verbose = args.includes('--verbose');

  return {
    topK: Number.isFinite(topK) ? Math.max(5, Math.min(20, topK)) : 10,
    verbose,
  };
}

function inferPreferredLevels(student) {
  const explicitLevel = normalizeText(student?.experienceLevel || '');

  if (explicitLevel === 'senior') return ['senior', 'middle', 'junior'];
  if (explicitLevel === 'middle') return ['middle', 'junior', 'fresher'];
  if (explicitLevel === 'junior') return ['junior', 'fresher', 'intern'];
  if (explicitLevel === 'fresher') return ['fresher', 'intern', 'junior'];
  if (explicitLevel === 'none') return ['intern', 'fresher', 'junior'];

  const academicYear = normalizeText(student?.academicYear || '');
  if (['1', '2'].includes(academicYear)) return ['intern', 'fresher'];
  if (['3', '4', '5'].includes(academicYear)) return ['intern', 'fresher', 'junior'];
  if (academicYear === 'graduated') return ['fresher', 'junior', 'middle'];

  const gradYear = student?.graduationYear;
  const currentYear = new Date().getFullYear();

  if (!gradYear) return ['intern', 'fresher', 'junior'];

  const delta = gradYear - currentYear;
  if (delta >= 1) return ['intern', 'fresher'];
  if (delta === 0) return ['intern', 'fresher', 'junior'];
  return ['fresher', 'junior', 'middle'];
}

function getLevelFit(jobLevel, preferredLevels = []) {
  const target = normalizeText(jobLevel);
  const idx = preferredLevels.findIndex((x) => normalizeText(x) === target);

  if (idx === 0) return 1.0;
  if (idx === 1) return 0.75;
  if (idx === 2) return 0.35;

  if (['intern', 'fresher', 'junior'].includes(target)) return 0.2;
  return 0;
}

function evaluateOneRecommendedJob(student, job) {
  const studentSkills = uniqueNormalized([
    ...(student.skills || []),
    ...(student.projectTechnologies || []),
  ]);
  const studentCategories = uniqueNormalized(student.preferredCategories || []);
  const studentJobTypes = uniqueNormalized(student.preferredJobTypes || []);
  const studentWorkModes = uniqueNormalized(student.preferredWorkModes || []);
  const studentLocations = uniqueNormalized(student.preferredLocations || []);
  const desiredTitles = uniqueNormalized(student.desiredJobTitles || []);
  const studentMajor = normalizeText(student.major || '');

  const requiredSkills = uniqueNormalized(
    job.requiredSkills?.length ? job.requiredSkills : job.skills || []
  );
  const preferredSkills = uniqueNormalized(job.preferredSkills || []);
  const categories = uniqueNormalized(job.categories || []);
  const acceptableMajors = uniqueNormalized(job.acceptableMajors || []);
  const jobType = normalizeText(job.jobType || '');
  const workMode = normalizeText(job.workMode || '');
  const city = normalizeText(job.location?.city || '');
  const jobTitle = normalizeText(job.title || '');

  const matchedRequired = intersectCount(requiredSkills, studentSkills);
  const matchedPreferred = intersectCount(preferredSkills, studentSkills);
  const matchedCategories = intersectCount(categories, studentCategories);

  const requiredSkillFit = requiredSkills.length
    ? ratio(matchedRequired, requiredSkills.length)
    : 0.2;

  const preferredSkillFit = preferredSkills.length
    ? ratio(matchedPreferred, preferredSkills.length)
    : 0.2;

  const categoryFit = categories.length && studentCategories.length
    ? ratio(matchedCategories, Math.min(categories.length, 3))
    : 0;

  const titleExact = desiredTitles.some((t) => t && jobTitle.includes(t));
  const titleLoose = desiredTitles.some((t) =>
    t.split(' ').some((token) => token && token.length >= 3 && jobTitle.includes(token))
  );
  const titleFit = titleExact ? 1 : titleLoose ? 0.7 : 0;

  const majorFit = studentMajor
    ? (acceptableMajors.includes(studentMajor) ? 1 : 0)
    : 0;

  const jobTypeFit = studentJobTypes.length
    ? (studentJobTypes.includes(jobType) ? 1 : 0)
    : 0.5;

  const workModeFit = studentWorkModes.length
    ? (studentWorkModes.includes(workMode) ? 1 : 0)
    : 0.5;

  const locationFit = studentLocations.length
    ? (studentLocations.includes(city) ? 1 : 0)
    : 0.4;

  const levelFit = getLevelFit(job.level, inferPreferredLevels(student));

  const hasStrongSignal =
    requiredSkillFit >= 0.35 ||
    titleFit >= 0.7 ||
    (majorFit >= 1 && categoryFit >= 0.33);

  const hasRelevantSignal =
    requiredSkillFit >= 0.15 ||
    preferredSkillFit >= 0.2 ||
    categoryFit >= 0.2 ||
    titleFit >= 0.4 ||
    majorFit >= 1;

  // Compatibility score để đo chất lượng recommend
  const compatibilityScore =
    100 * (
      0.34 * requiredSkillFit +
      0.08 * preferredSkillFit +
      0.16 * categoryFit +
      0.14 * titleFit +
      0.12 * majorFit +
      0.07 * jobTypeFit +
      0.04 * workModeFit +
      0.03 * locationFit +
      0.02 * levelFit
    );

  const isStrongMatch =
    hasStrongSignal && compatibilityScore >= 35;

  const isAcceptableMatch =
    (hasRelevantSignal && compatibilityScore >= 22) ||
    isStrongMatch;

  return {
    compatibilityScore: Number(compatibilityScore.toFixed(2)),
    isStrongMatch,
    isAcceptableMatch,
    signals: {
      requiredSkillFit,
      preferredSkillFit,
      categoryFit,
      titleFit,
      majorFit,
      jobTypeFit,
      workModeFit,
      locationFit,
      levelFit,
    },
  };
}

async function callCurrentRecommendation(studentId, topK = 10) {
  const req = {
    user: {
      userId: String(studentId),
      role: 'student',
    },
    query: {
      limit: String(topK),
    },
  };

  return new Promise(async (resolve, reject) => {
    const res = {
      statusCode: 200,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.payload = data;
        resolve({
          statusCode: this.statusCode,
          body: data,
        });
      },
    };

    try {
      await recommendationController.getRecommendedJobs(req, res);
    } catch (err) {
      reject(err);
    }
  });
}

// =========================
// Main
// =========================
async function main() {
  const { topK, verbose } = parseArgs();

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');
  console.log(`📏 Đang đánh giá consistency với topK = ${topK}`);

  const students = await Student.find({
    email: { $in: SEED_STUDENT_EMAILS.map((e) => e.toLowerCase()) },
  }).select(`
    _id email fullName major skills preferredLocations preferredCategories
    preferredJobTypes preferredWorkModes desiredJobTitles projectTechnologies
    experienceLevel academicYear graduationYear
  `);

  if (!students.length) {
    console.log('⚠️ Không tìm thấy seed students để đánh giá.');
    await mongoose.disconnect();
    return;
  }

  let totalTop5MatchRate = 0;
  let totalTop10MatchRate = 0;
  let totalStrongTop3Rate = 0;
  let evaluated = 0;

  for (const student of students) {
    const recResult = await callCurrentRecommendation(student._id, topK);

    if (recResult.statusCode !== 200 || !recResult.body?.success) {
      console.log(`❌ [${student.email}] Recommendation API trả lỗi`, recResult.body);
      continue;
    }

    const recommendedJobs = recResult.body.jobs || [];
    if (!recommendedJobs.length) {
      console.log(`⚠️ [${student.email}] Không có job được recommend.`);
      continue;
    }

    const judged = recommendedJobs.map((job) => ({
      job,
      judge: evaluateOneRecommendedJob(student, job),
    }));

    const top5 = judged.slice(0, 5);
    const top10 = judged.slice(0, Math.min(10, judged.length));
    const top3 = judged.slice(0, Math.min(3, judged.length));

    const top5Acceptable = top5.filter((x) => x.judge.isAcceptableMatch).length;
    const top10Acceptable = top10.filter((x) => x.judge.isAcceptableMatch).length;
    const hasStrongTop3 = top3.some((x) => x.judge.isStrongMatch);

    const top5MatchRate = top5.length ? top5Acceptable / top5.length : 0;
    const top10MatchRate = top10.length ? top10Acceptable / top10.length : 0;
    const strongTop3Rate = hasStrongTop3 ? 1 : 0;

    totalTop5MatchRate += top5MatchRate;
    totalTop10MatchRate += top10MatchRate;
    totalStrongTop3Rate += strongTop3Rate;
    evaluated += 1;

    console.log(`\n👤 ${student.fullName} (${student.email})`);
    console.log(`   Top5 Match Rate   : ${formatPercent(top5MatchRate)}`);
    console.log(`   Top10 Match Rate  : ${formatPercent(top10MatchRate)}`);
    console.log(`   Strong in Top3    : ${hasStrongTop3 ? 'YES' : 'NO'}`);

    if (verbose) {
      console.log('   🔎 Recommended Top 5 (judged):');
      top5.forEach((x, idx) => {
        console.log(
          `      ${idx + 1}. ${x.job.title} | rec=${x.job.recommendation?.score ?? 'n/a'} | fit=${x.judge.compatibilityScore} | acceptable=${x.judge.isAcceptableMatch ? 'Y' : 'N'} | strong=${x.judge.isStrongMatch ? 'Y' : 'N'}`
        );
      });
    }
  }

  if (!evaluated) {
    console.log('\n⚠️ Không có bản ghi nào được đánh giá thành công.');
    await mongoose.disconnect();
    return;
  }

  const avgTop5 = totalTop5MatchRate / evaluated;
  const avgTop10 = totalTop10MatchRate / evaluated;
  const avgStrongTop3 = totalStrongTop3Rate / evaluated;

  console.log('\n================ SUMMARY ================');
  console.log(`Students evaluated : ${evaluated}`);
  console.log(`Average Top5 Match : ${formatPercent(avgTop5)}`);
  console.log(`Average Top10 Match: ${formatPercent(avgTop10)}`);
  console.log(`Strong in Top3     : ${formatPercent(avgStrongTop3)}`);
  console.log('=========================================');

  if (avgTop5 >= 0.7) {
    console.log('✅ Recommender đang khá tốt ở top đầu.');
  } else if (avgTop5 >= 0.5) {
    console.log('🟡 Recommender ở mức khá, có thể tinh chỉnh thêm để sạch top 5.');
  } else {
    console.log('🔴 Top 5 vẫn còn nhiễu, nên tiếp tục siết ranking.');
  }

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

main().catch(async (err) => {
  console.error('❌ Lỗi evaluateRecommendationConsistency:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});