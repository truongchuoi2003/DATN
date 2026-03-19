const mongoose = require('mongoose');
const Job = require('../models/Job.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const Interaction = require('../models/Interaction.model');
const { serializeJobListForClient } = require('../utils/jobResponse.helper');
require('../models/Employer.model');

// =========================
// Helpers
// =========================
const normalizeText = (str = '') =>
  String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const uniqueLower = (arr = []) =>
  [...new Set((arr || []).map((x) => normalizeText(x)).filter(Boolean))];

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

const intersection = (a = [], b = []) => {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
};

const ratio = (numerator, denominator) => {
  if (!denominator || denominator <= 0) return 0;
  return clamp(numerator / denominator, 0, 1);
};

const daysSince = (date) => {
  if (!date) return 9999;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, diff / (1000 * 60 * 60 * 24));
};

const expDecay = (x, scale) => {
  if (!Number.isFinite(x) || !Number.isFinite(scale) || scale <= 0) return 0;
  return Math.exp(-x / scale);
};

const toRad = (deg) => (deg * Math.PI) / 180;

const haversineKm = (coordsA, coordsB) => {
  if (
    !Array.isArray(coordsA) ||
    !Array.isArray(coordsB) ||
    coordsA.length < 2 ||
    coordsB.length < 2
  ) {
    return null;
  }

  const [lng1, lat1] = coordsA.map(Number);
  const [lng2, lat2] = coordsB.map(Number);

  if ([lng1, lat1, lng2, lat2].some((x) => Number.isNaN(x))) {
    return null;
  }

  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
};

const log1pNorm = (value, divisor = 8) => {
  const raw = Math.log(1 + Math.max(0, Number(value) || 0));
  return clamp(raw / divisor, 0, 1);
};

const inferPreferredLevels = (student) => {
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
};

const getLevelDistance = (jobLevel, preferredLevels = []) => {
  const target = normalizeText(jobLevel);
  const idx = preferredLevels.findIndex((x) => normalizeText(x) === target);
  if (idx === 0) return 0;
  if (idx === 1) return 1;
  if (idx === 2) return 2;

  if (['intern', 'fresher', 'junior'].includes(target)) return 3;
  return 99;
};

const getLevelFitScore = (jobLevel, preferredLevels = []) => {
  const distance = getLevelDistance(jobLevel, preferredLevels);
  if (distance === 0) return 1;
  if (distance === 1) return 0.75;
  if (distance === 2) return 0.35;
  if (distance === 3) return 0.2;
  return 0;
};

const getDefaultStudentFriendlyJobTypeScore = (jobType) => {
  const type = normalizeText(jobType);
  if (type === 'internship') return 1;
  if (type === 'part-time') return 0.95;
  if (type === 'full-time') return 0.55;
  if (['contract', 'freelance'].includes(type)) return 0.35;
  return 0.4;
};

const pickTopKeys = (scoreMap, topN = 10) =>
  [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([key]) => key);

const mergeCandidateJobs = (...jobLists) => {
  const map = new Map();

  for (const list of jobLists) {
    for (const job of safeArray(list)) {
      if (!job?._id) continue;
      const key = String(job._id);
      if (!map.has(key)) {
        map.set(key, job);
      }
    }
  }

  return [...map.values()];
};

const baseJobFilter = ({ now, excludedJobIds = [] }) => ({
  status: 'active',
  isVerified: true,
  deadline: { $gte: now },
  ...(excludedJobIds.length ? { _id: { $nin: excludedJobIds } } : {}),
});

// =========================
// Behavior profile
// =========================
const getStudentBehaviorProfile = async (studentId) => {
  const interactions = await Interaction.find({ student: studentId })
    .sort({ createdAt: -1 })
    .select('job interactionType interactionValue createdAt');

  const stats = {
    view: 0,
    click: 0,
    save: 0,
    unsave: 0,
    apply: 0,
  };

  if (!interactions.length) {
    return {
      stats,
      latestSaveStateMap: new Map(),
      directSignalByJob: new Map(),
      positiveCategories: new Map(),
      softCategories: new Map(),
      negativeCategories: new Map(),
      positiveSkills: new Map(),
      softSkills: new Map(),
      negativeSkills: new Map(),
      positiveJobTypes: new Map(),
      softJobTypes: new Map(),
      negativeJobTypes: new Map(),
      positiveJobIds: [],
    };
  }

  // Lấy state save/unsave cuối cùng
  const latestSaveStateMap = new Map();
  for (const item of interactions) {
    const jobId = String(item.job);
    if (!latestSaveStateMap.has(jobId) && ['save', 'unsave'].includes(item.interactionType)) {
      latestSaveStateMap.set(jobId, item.interactionType);
    }
  }

  const directSignalByJob = new Map();
  const jobWeightMap = new Map();

  for (const item of interactions) {
    const type = item.interactionType;
    const jobId = String(item.job);
    const baseValue = Number(item.interactionValue || 0);
    const ageDays = daysSince(item.createdAt);

    if (stats[type] !== undefined) stats[type] += 1;

    // decay theo thời gian
    const recencyFactor = expDecay(ageDays, 30);

    // cap theo loại hành vi
    let eventWeight = 0;
    if (type === 'apply') eventWeight = 5.0;
    else if (type === 'save') eventWeight = 3.5;
    else if (type === 'click') eventWeight = 1.5;
    else if (type === 'view') eventWeight = 0.5;
    else if (type === 'unsave') eventWeight = -4.0;

    let weighted = Math.max(baseValue, 1) * eventWeight * recencyFactor;

    // Nếu save cũ nhưng state cuối không còn save => bỏ save đó
    if (type === 'save' && latestSaveStateMap.get(jobId) !== 'save') {
      weighted = 0;
    }

    directSignalByJob.set(jobId, (directSignalByJob.get(jobId) || 0) + weighted);
    jobWeightMap.set(jobId, (jobWeightMap.get(jobId) || 0) + weighted);
  }

  const involvedJobIds = [...jobWeightMap.keys()]
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const interactedJobs = involvedJobIds.length
    ? await Job.find({ _id: { $in: involvedJobIds } }).select(
        'jobType categories requiredSkills preferredSkills skills'
      )
    : [];

  const positiveCategories = new Map();
  const softCategories = new Map();
  const negativeCategories = new Map();

  const positiveSkills = new Map();
  const softSkills = new Map();
  const negativeSkills = new Map();

  const positiveJobTypes = new Map();
  const softJobTypes = new Map();
  const negativeJobTypes = new Map();

  const positiveJobIds = [];

  const addScoreToMap = (map, key, score) => {
    if (!key) return;
    map.set(key, (map.get(key) || 0) + score);
  };

  for (const job of interactedJobs) {
    const jobId = String(job._id);
    const totalWeight = jobWeightMap.get(jobId) || 0;
    if (totalWeight === 0) continue;

    if (totalWeight > 1) positiveJobIds.push(jobId);

    const bucket =
      totalWeight >= 1
        ? 'positive'
        : totalWeight > 0
        ? 'soft'
        : 'negative';

    const categories = uniqueLower(job.categories || []);
    const skills = uniqueLower([
      ...(job.requiredSkills || []),
      ...(job.preferredSkills || []),
      ...(job.skills || []),
    ]);
    const jobType = normalizeText(job.jobType || '');

    const absWeight = Math.min(Math.abs(totalWeight), 6);

    for (const cat of categories) {
      if (bucket === 'positive') addScoreToMap(positiveCategories, cat, absWeight);
      else if (bucket === 'soft') addScoreToMap(softCategories, cat, absWeight);
      else addScoreToMap(negativeCategories, cat, absWeight);
    }

    for (const skill of skills) {
      if (bucket === 'positive') addScoreToMap(positiveSkills, skill, absWeight);
      else if (bucket === 'soft') addScoreToMap(softSkills, skill, absWeight);
      else addScoreToMap(negativeSkills, skill, absWeight);
    }

    if (jobType) {
      if (bucket === 'positive') addScoreToMap(positiveJobTypes, jobType, absWeight);
      else if (bucket === 'soft') addScoreToMap(softJobTypes, jobType, absWeight);
      else addScoreToMap(negativeJobTypes, jobType, absWeight);
    }
  }

  return {
    stats,
    latestSaveStateMap,
    directSignalByJob,
    positiveCategories,
    softCategories,
    negativeCategories,
    positiveSkills,
    softSkills,
    negativeSkills,
    positiveJobTypes,
    softJobTypes,
    negativeJobTypes,
    positiveJobIds,
  };
};

// =========================
// Candidate generation
// =========================
const buildCandidatePool = async ({
  student,
  now,
  excludedJobIds,
  behaviorProfile,
  limit,
}) => {
  const filter = baseJobFilter({ now, excludedJobIds });

  const studentSkills = uniqueLower([
    ...(student.skills || []),
    ...(student.projectTechnologies || []),
  ]);
  const studentCategories = uniqueLower(student.preferredCategories || []);
  const preferredJobTypes = uniqueLower(student.preferredJobTypes || []);
  const preferredLocations = uniqueLower(student.preferredLocations || []);
  const studentCoords = Array.isArray(student.location?.coordinates)
    ? student.location.coordinates
    : null;

  const candidateLimit = Math.min(Math.max(limit * 8, 32), 96);

  const preferredCategorySeeds = pickTopKeys(behaviorProfile.positiveCategories, 4);
  const preferredSkillSeeds = pickTopKeys(behaviorProfile.positiveSkills, 8);
  const behaviorJobTypeSeeds = pickTopKeys(behaviorProfile.positiveJobTypes, 2);

  const unionSkills = [...new Set([...studentSkills, ...preferredSkillSeeds])];
  const unionCategories = [...new Set([...studentCategories, ...preferredCategorySeeds])];
  const unionJobTypes = [...new Set([...preferredJobTypes, ...behaviorJobTypeSeeds])];

  let preferredTypeJobs = [];
  let skillJobs = [];
  let categoryJobs = [];
  let geoJobs = [];
  let cityJobs = [];
  let fallbackJobs = [];

  if (unionJobTypes.length) {
    preferredTypeJobs = await Job.find({
      ...filter,
      jobType: { $in: unionJobTypes },
    })
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .limit(Math.ceil(candidateLimit * 0.4));
  }

  if (unionSkills.length) {
    skillJobs = await Job.find({
      ...filter,
      $or: [
        { requiredSkills: { $in: unionSkills } },
        { preferredSkills: { $in: unionSkills } },
        { skills: { $in: unionSkills } },
      ],
    })
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .limit(Math.ceil(candidateLimit * 0.55));
  }

  if (unionCategories.length) {
    categoryJobs = await Job.find({
      ...filter,
      categories: { $in: unionCategories },
    })
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .limit(Math.ceil(candidateLimit * 0.45));
  }

  if (studentCoords) {
    geoJobs = await Job.find({
      ...filter,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: studentCoords,
          },
          $maxDistance: 25000, // 25km
        },
      },
    })
      .populate('employer', 'companyName logo website')
      .limit(Math.ceil(candidateLimit * 0.45));
  } else if (preferredLocations.length) {
    cityJobs = await Job.find({
      ...filter,
      'location.city': { $in: preferredLocations },
    })
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .limit(Math.ceil(candidateLimit * 0.35));
  }

  // fallback nền
  fallbackJobs = await Job.find(filter)
    .populate('employer', 'companyName logo website')
    .sort({ createdAt: -1 })
    .limit(Math.ceil(candidateLimit * 0.35));

  let merged = mergeCandidateJobs(
    preferredTypeJobs,
    skillJobs,
    categoryJobs,
    geoJobs,
    cityJobs,
    fallbackJobs
  );

  // Nếu vẫn ít quá thì nới nhẹ nhưng vẫn giữ verified + deadline
  if (merged.length < limit) {
    const existingIds = merged.map((j) => j._id);
    const extra = await Job.find({
      ...filter,
      ...(existingIds.length ? { _id: { $nin: existingIds } } : {}),
    })
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .limit(candidateLimit);

    merged = mergeCandidateJobs(merged, extra);
  }

  return merged.slice(0, candidateLimit);
};

// =========================
// Score engine
// =========================
const scoreJobForStudent = ({
  student,
  job,
  preferredLevels,
  behaviorProfile,
}) => {
  const reasons = [];
  const breakdown = {};

  // -------- Normalize inputs --------
  const studentSkills = uniqueLower(student.skills || []);
  const studentTech = uniqueLower(student.projectTechnologies || []);
  const profileSkills = [...new Set([...studentSkills, ...studentTech])];

  const preferredCategories = uniqueLower(student.preferredCategories || []);
  const desiredTitles = uniqueLower(student.desiredJobTitles || []);
  const preferredLocations = uniqueLower(student.preferredLocations || []);
  const preferredWorkModes = uniqueLower(student.preferredWorkModes || []);
  const preferredJobTypes = uniqueLower(student.preferredJobTypes || []);
  const studentMajor = normalizeText(student.major || '');

  const requiredSkills = uniqueLower(
    job.requiredSkills?.length ? job.requiredSkills : job.skills || []
  );
  const preferredSkills = uniqueLower(job.preferredSkills || []);
  const jobCategories = uniqueLower(job.categories || []);
  const acceptableMajors = uniqueLower(job.acceptableMajors || []);
  const jobTitle = normalizeText(job.title || '');
  const jobDesc = normalizeText(job.description || '');
  const jobReq = normalizeText(job.requirements || '');
  const jobType = normalizeText(job.jobType || '');
  const workMode = normalizeText(job.workMode || '');
  const city = normalizeText(job.location?.city || '');

  const studentCoords = Array.isArray(student.location?.coordinates)
    ? student.location.coordinates
    : null;
  const jobCoords = Array.isArray(job.location?.coordinates)
    ? job.location.coordinates
    : null;

  // -------- A. ProfileMatch --------
  // 1) RequiredSkillFit
  let requiredSkillFit = 0;
  let matchedRequired = [];
  if (profileSkills.length && requiredSkills.length) {
    matchedRequired = intersection(requiredSkills, profileSkills);
    requiredSkillFit = ratio(matchedRequired.length, requiredSkills.length);

    const missingRatio = 1 - requiredSkillFit;
    if (missingRatio > 0.75) requiredSkillFit *= 0.3;
    else if (missingRatio > 0.5) requiredSkillFit *= 0.6;
  } else if (!requiredSkills.length) {
    requiredSkillFit = 0.55;
  }

  if (matchedRequired.length) {
    reasons.push(`Khớp kỹ năng chính: ${matchedRequired.slice(0, 3).join(', ')}`);
  }

  // 2) PreferredSkillFit
  let preferredSkillFit = 0.5;
  let matchedPreferred = [];
  if (preferredSkills.length) {
    matchedPreferred = intersection(preferredSkills, profileSkills);
    preferredSkillFit = ratio(matchedPreferred.length, preferredSkills.length);
    if (matchedPreferred.length) {
      reasons.push(`Có lợi thế thêm: ${matchedPreferred.slice(0, 2).join(', ')}`);
    }
  }

  // 3) MajorFit
  let majorFit = 0;
  if (!studentMajor) {
    majorFit = 0.35;
  } else if (acceptableMajors.length && acceptableMajors.includes(studentMajor)) {
    majorFit = 1;
    reasons.push('Ngành học phù hợp trực tiếp');
  } else if (jobTitle.includes(studentMajor)) {
    majorFit = 0.75;
    reasons.push('Tiêu đề công việc liên quan chuyên ngành');
  } else if (jobDesc.includes(studentMajor) || jobReq.includes(studentMajor)) {
    majorFit = 0.55;
    reasons.push('Mô tả công việc có liên quan đến chuyên ngành');
  }

  // 4) CategoryFit
  let categoryFit = 0.45;
  const matchedCategories = intersection(jobCategories, preferredCategories);
  if (preferredCategories.length && jobCategories.length) {
    categoryFit = ratio(matchedCategories.length, Math.max(1, Math.min(jobCategories.length, 3)));
  } else if (!preferredCategories.length && jobCategories.length) {
    categoryFit = 0.4;
  }

  if (matchedCategories.length) {
    reasons.push(`Đúng nhóm nghề quan tâm: ${matchedCategories[0]}`);
  }

  // 5) TitleFit
  let titleFit = 0.35;
  if (desiredTitles.length) {
    const exactish = desiredTitles.find((wanted) => wanted && jobTitle.includes(wanted));
    const loose = desiredTitles.find(
      (wanted) =>
        wanted &&
        wanted.split(' ').some((token) => token && token.length >= 3 && jobTitle.includes(token))
    );

    if (exactish) {
      titleFit = 1;
      reasons.push(`Gần với vị trí mong muốn: ${job.title}`);
    } else if (loose) {
      titleFit = 0.7;
      reasons.push('Tên vị trí có nhiều điểm gần với mong muốn');
    } else {
      titleFit = 0.05;
    }
  }

  // 6) LevelFit
  const levelFit = getLevelFitScore(job.level, preferredLevels);
  if (levelFit >= 0.75) {
    reasons.push(`Phù hợp cấp độ: ${job.level}`);
  }

  // 7) WorkModeFit
  let workModeFit = 0.5;
  if (preferredWorkModes.length && workMode) {
    workModeFit = preferredWorkModes.includes(workMode) ? 1 : 0.1;
    if (workModeFit === 1) {
      reasons.push(`Đúng hình thức làm việc: ${job.workMode}`);
    }
  }

  // 8) SalaryFit
  let salaryFit = 0.5;
  const desiredMin = Number(student.salaryExpectation?.min || 0);
  const desiredMax = Number(student.salaryExpectation?.max || 0);
  const jobMin = Number(job.salary?.min || 0);
  const jobMax = Number(job.salary?.max || 0);

  if (desiredMin > 0 || desiredMax > 0) {
    const userLow = desiredMin > 0 ? desiredMin : 0;
    const userHigh = desiredMax > 0 ? desiredMax : Number.MAX_SAFE_INTEGER;
    const overlapLow = Math.max(userLow, jobMin);
    const overlapHigh = Math.min(userHigh, jobMax);

    if (job.salary?.negotiable) {
      salaryFit = 0.7;
    } else if (overlapHigh >= overlapLow) {
      salaryFit = 1;
      reasons.push('Khoảng lương phù hợp');
    } else {
      const ref = Math.max(userLow || 1, jobMin || 1);
      const gap = Math.abs((jobMax || jobMin || 0) - (desiredMin || desiredMax || 0)) / ref;

      if (gap <= 0.15) salaryFit = 0.7;
      else if (gap <= 0.35) salaryFit = 0.3;
      else salaryFit = 0;
    }
  }

  // 9) LanguageOrCertFit
  // Job model hiện chưa có field riêng cho language/cert, nên chỉ dùng neutral + text hint nhẹ
  let languageOrCertFit = 0.5;
  const studentLanguages = safeArray(student.languages)
    .map((x) => normalizeText(x?.name))
    .filter(Boolean);
  const studentCerts = uniqueLower(student.certifications || []);
  const textBlob = `${jobTitle} ${jobDesc} ${jobReq}`;

  const hasEnglishSignal =
    /english|toeic|ielts|giao tiếp tiếng anh|tieng anh/.test(textBlob);

  if (hasEnglishSignal) {
    if (
      studentLanguages.some((x) => x.includes('english') || x.includes('anh')) ||
      studentCerts.some((x) => x.includes('toeic') || x.includes('ielts'))
    ) {
      languageOrCertFit = 0.9;
      reasons.push('Ngoại ngữ/chứng chỉ có lợi thế cho vị trí này');
    } else {
      languageOrCertFit = 0.2;
    }
  }

  const profileMatch =
    0.34 * requiredSkillFit +
    0.10 * preferredSkillFit +
    0.14 * majorFit +
    0.10 * categoryFit +
    0.08 * titleFit +
    0.08 * levelFit +
    0.06 * workModeFit +
    0.05 * salaryFit +
    0.05 * languageOrCertFit;

  breakdown.profile = {
    requiredSkillFit,
    preferredSkillFit,
    majorFit,
    categoryFit,
    titleFit,
    levelFit,
    workModeFit,
    salaryFit,
    languageOrCertFit,
    score: clamp(profileMatch),
  };
  let profilePenaltyMultiplier = 1;

  // Nếu job không có tín hiệu khớp đủ mạnh thì hạ mạnh điểm
  const hasStrongProfileSignal =
    requiredSkillFit >= 0.35 ||
    titleFit >= 0.7 ||
    (majorFit >= 1 && categoryFit >= 0.33);

  const hasAnyRelevantSignal =
    requiredSkillFit >= 0.15 ||
    preferredSkillFit >= 0.2 ||
    categoryFit >= 0.2 ||
    titleFit >= 0.4;

  if (!hasStrongProfileSignal) {
    profilePenaltyMultiplier *= 0.62;
  }

  if (!hasAnyRelevantSignal) {
    profilePenaltyMultiplier *= 0.40;
    reasons.push('Mức độ khớp hồ sơ chưa cao');
  }
  // -------- B. BehaviorMatch --------
  const jobId = String(job._id);
  const directSignal = behaviorProfile.directSignalByJob.get(jobId) || 0;
  const latestSaved = behaviorProfile.latestSaveStateMap.get(jobId) === 'save';

  const behaviorCategories = jobCategories;
  const behaviorSkills = uniqueLower([
    ...(job.requiredSkills || []),
    ...(job.preferredSkills || []),
    ...(job.skills || []),
  ]);

  const scoreFromWeightedMap = (values, weightedMap, normalizer = 8) => {
    if (!values.length || !weightedMap.size) return 0;
    const sum = values.reduce((acc, key) => acc + (weightedMap.get(key) || 0), 0);
    return clamp(sum / normalizer, 0, 1);
  };

  const positiveAffinity =
    0.45 * scoreFromWeightedMap(behaviorCategories, behaviorProfile.positiveCategories, 8) +
    0.40 * scoreFromWeightedMap(behaviorSkills, behaviorProfile.positiveSkills, 12) +
    0.15 * scoreFromWeightedMap([jobType], behaviorProfile.positiveJobTypes, 5);

  const softInterestAffinity =
    0.45 * scoreFromWeightedMap(behaviorCategories, behaviorProfile.softCategories, 8) +
    0.40 * scoreFromWeightedMap(behaviorSkills, behaviorProfile.softSkills, 12) +
    0.15 * scoreFromWeightedMap([jobType], behaviorProfile.softJobTypes, 5);

  const negativeAffinity =
    0.45 * scoreFromWeightedMap(behaviorCategories, behaviorProfile.negativeCategories, 8) +
    0.40 * scoreFromWeightedMap(behaviorSkills, behaviorProfile.negativeSkills, 12) +
    0.15 * scoreFromWeightedMap([jobType], behaviorProfile.negativeJobTypes, 5);

  let behaviorMatch =
    0.50 * positiveAffinity +
    0.30 * softInterestAffinity -
    0.20 * negativeAffinity;

  // direct signal chỉ là phần bổ trợ, không cho lấn át
  if (directSignal > 0) {
    behaviorMatch += clamp(directSignal / 12, 0, 0.35);
  } else if (directSignal < 0) {
    behaviorMatch -= clamp(Math.abs(directSignal) / 12, 0, 0.35);
  }

  if (latestSaved) {
    behaviorMatch = Math.max(behaviorMatch, 0.85);
    reasons.push('Bạn đã lưu công việc này');
  } else if (behaviorMatch >= 0.45) {
    reasons.push('Phù hợp với nhóm việc bạn từng quan tâm');
  }

  behaviorMatch = clamp(behaviorMatch, 0, 1);

  breakdown.behavior = {
    positiveAffinity,
    softInterestAffinity,
    negativeAffinity,
    directSignal,
    latestSaved,
    score: behaviorMatch,
  };

  // -------- C. ContextMatch --------
  // 1) LocationFit
  let locationFit = 0.35;
  const distanceKm = haversineKm(studentCoords, jobCoords);

  if (distanceKm !== null) {
    locationFit = clamp(expDecay(distanceKm, 12), 0, 1);
    if (distanceKm <= 12) {
      reasons.push(`Địa điểm khá gần (~${Math.round(distanceKm)} km)`);
    }
  } else if (preferredLocations.length && city) {
    locationFit = preferredLocations.includes(city) ? 0.85 : 0.15;
    if (locationFit >= 0.85) {
      reasons.push(`Đúng khu vực mong muốn: ${job.location?.city || job.location?.address || ''}`);
    }
  } else if (city && normalizeText(student.address || '').includes(city)) {
    locationFit = 0.7;
    reasons.push(`Địa điểm tương đối phù hợp: ${job.location?.city || ''}`);
  }

  // 2) JobTypeFit
  let jobTypeFit = 0.5;
  if (preferredJobTypes.length) {
    jobTypeFit = preferredJobTypes.includes(jobType) ? 1 : 0.2;
    if (jobTypeFit === 1) {
      reasons.push(`Đúng loại công việc mong muốn: ${job.jobType}`);
    }
  } else {
    jobTypeFit = getDefaultStudentFriendlyJobTypeScore(jobType);
  }

  // 3) StudentFriendlyFit
  let studentFriendlyFit = 0.35;
  if (['internship', 'part-time'].includes(jobType)) studentFriendlyFit = 1;
  else if (jobType === 'full-time') studentFriendlyFit = 0.6;

  if (['intern', 'fresher'].includes(normalizeText(job.level || ''))) {
    studentFriendlyFit = Math.max(studentFriendlyFit, 0.95);
  } else if (normalizeText(job.level || '') === 'junior') {
    studentFriendlyFit = Math.max(studentFriendlyFit, 0.7);
  }

  const contextMatch =
    0.60 * locationFit +
    0.25 * jobTypeFit +
    0.15 * studentFriendlyFit;

  breakdown.context = {
    locationFit,
    jobTypeFit,
    studentFriendlyFit,
    distanceKm,
    score: clamp(contextMatch),
  };

  // -------- D. Freshness + Popularity --------
  const ageDays = daysSince(job.createdAt);
  const freshnessMatch = clamp(expDecay(ageDays, 10), 0, 1);
  if (freshnessMatch >= 0.7) {
    reasons.push('Tin đăng mới');
  }

  const popularityRaw = Math.log(
    1 + Math.max(0, Number(job.views || 0)) + 2 * Math.max(0, Number(job.applicationsCount || 0))
  );
  const popularityMatch = clamp(popularityRaw / 8, 0, 1);

  breakdown.freshness = { ageDays, score: freshnessMatch };
  breakdown.popularity = {
    views: Number(job.views || 0),
    applicationsCount: Number(job.applicationsCount || 0),
    score: popularityMatch,
  };

  // -------- E. Profile confidence + cold start --------
  const signals = [
    profileSkills.length > 0,
    !!studentMajor,
    preferredCategories.length > 0,
    desiredTitles.length > 0,
    preferredLocations.length > 0,
    preferredJobTypes.length > 0,
    preferredWorkModes.length > 0,
    Array.isArray(student.location?.coordinates) && student.location.coordinates.length >= 2,
  ];

  const filledSignals = signals.filter(Boolean).length;
  const totalSignals = signals.length;
  const profileConfidence = clamp(0.35 + 0.65 * (filledSignals / totalSignals), 0.35, 1);

  const mainPersonalizedScore =
    0.68 * breakdown.profile.score +
    0.10 * breakdown.behavior.score +
    0.14 * breakdown.context.score +
    0.05 * freshnessMatch +
    0.03 * popularityMatch;

  const coldStartScore =
    0.40 * studentFriendlyFit +
    0.30 * freshnessMatch +
    0.20 * popularityMatch +
    0.10 * locationFit;

  const finalScore =
    100 *
    (
      profileConfidence * mainPersonalizedScore +
      (1 - profileConfidence) * coldStartScore
    ) *
    profilePenaltyMultiplier;

  breakdown.final = {
    profileConfidence,
    mainPersonalizedScore: clamp(mainPersonalizedScore),
    coldStartScore: clamp(coldStartScore),
    finalScore: Math.round(finalScore * 100) / 100,
  };

  if (!profileSkills.length) reasons.push('Hãy cập nhật kỹ năng để gợi ý chính xác hơn');
  if (!studentMajor) reasons.push('Hãy cập nhật chuyên ngành để gợi ý chính xác hơn');
  if (!preferredJobTypes.length) reasons.push('Hãy chọn loại hình công việc mong muốn để gợi ý sát hơn');

  return {
    score: breakdown.final.finalScore,
    reasons: [...new Set(reasons)].slice(0, 5),
    breakdown,
  };
};

// =========================
// Diversity re-rank
// =========================
const diversifyJobs = (rankedJobs, limit) => {
  const selected = [];
  const employerCount = new Map();
  const categoryCount = new Map();

  for (const item of rankedJobs) {
    if (selected.length >= limit) break;

    const employerId = String(item.employer?._id || item.employer || '');
    const primaryCategory = normalizeText(item.categories?.[0] || '');

    const employerUsed = employerCount.get(employerId) || 0;
    const categoryUsed = categoryCount.get(primaryCategory) || 0;

    const canTake =
      employerUsed < 3 &&
      categoryUsed < 4;

    if (canTake) {
      selected.push(item);
      employerCount.set(employerId, employerUsed + 1);
      if (primaryCategory) {
        categoryCount.set(primaryCategory, categoryUsed + 1);
      }
    }
  }

  if (selected.length < limit) {
    for (const item of rankedJobs) {
      if (selected.length >= limit) break;
      if (!selected.find((x) => String(x._id) === String(item._id))) {
        selected.push(item);
      }
    }
  }

  return selected;
};

// =========================
// GET /api/recommendations/jobs
// =========================
exports.getRecommendedJobs = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const limit = Math.min(Math.max(parseInt(req.query.limit || '6', 10), 1), 20);

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể dùng gợi ý việc làm',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'UserId không hợp lệ',
      });
    }

    const student = await Student.findById(userId).select(`
      fullName major skills address graduationYear gpa location resumeUrl university preferredJobTypes
      academicYear preferredCategories desiredJobTitles preferredLocations preferredWorkModes
      experienceLevel experienceMonths projectTechnologies projects
      salaryExpectation languages certifications
    `);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ sinh viên',
      });
    }

    // Loại job đã apply thành công / đang xử lý
    const applications = await Application.find({
      student: userId,
      status: { $nin: ['withdrawn', 'rejected'] },
    }).select('job');

    const excludedJobIds = applications.map((a) => a.job);
    const now = new Date();

    // Xây behavior profile
    const behaviorProfile = await getStudentBehaviorProfile(userId);

    // Candidate pool
    const candidates = await buildCandidatePool({
      student,
      now,
      excludedJobIds,
      behaviorProfile,
      limit,
    });

    const preferredLevels = inferPreferredLevels(student);

    // Ranking
    const ranked = candidates
      .map((job) => {
        const scored = scoreJobForStudent({
          student,
          job,
          preferredLevels,
          behaviorProfile,
        });

        return {
          ...job.toObject(),
          recommendation: {
            score: scored.score,
            reasons: scored.reasons,
            scoreBreakdown: scored.breakdown,
          },
        };
      })
      .filter((job) => {
        const breakdown = job.recommendation?.scoreBreakdown;
        if (!breakdown) return false;

        const profileScore = breakdown.profile?.score || 0;
        const finalScore = job.recommendation?.score || 0;

        const requiredSkillFit = breakdown.profile?.requiredSkillFit || 0;
        const categoryFit = breakdown.profile?.categoryFit || 0;
        const titleFit = breakdown.profile?.titleFit || 0;
        const majorFit = breakdown.profile?.majorFit || 0;

        const hasRelevantSignal =
          requiredSkillFit >= 0.15 ||
          categoryFit >= 0.2 ||
          titleFit >= 0.4 ||
          majorFit >= 1;

        return profileScore >= 0.22 && finalScore >= 22 && hasRelevantSignal;
      })
      .sort((a, b) => {
        const scoreDiff = (b.recommendation?.score || 0) - (a.recommendation?.score || 0);
        if (scoreDiff !== 0) return scoreDiff;

        // tie-break: job gần hơn nếu có tọa độ
        const aDistance = a.recommendation?.scoreBreakdown?.context?.distanceKm;
        const bDistance = b.recommendation?.scoreBreakdown?.context?.distanceKm;

        const aHasDist = Number.isFinite(aDistance);
        const bHasDist = Number.isFinite(bDistance);

        if (aHasDist && bHasDist && aDistance !== bDistance) {
          return aDistance - bDistance;
        }

        return new Date(b.createdAt) - new Date(a.createdAt);
      });

    const selected = diversifyJobs(ranked, limit);
    const normalizedSelected = serializeJobListForClient(selected);

    return res.status(200).json({
      success: true,
      count: selected.length,
      jobs: selected,
      meta: {
        mode: 'hybrid-rule-content-behavior-affinity-v2',
        totalCandidates: candidates.length,
        excludedAppliedJobs: excludedJobIds.length,
        studentSignals: {
          major: student.major || null,
          skillsCount: safeArray(student.skills).length,
          projectTechnologiesCount: safeArray(student.projectTechnologies).length,
          preferredCategoriesCount: safeArray(student.preferredCategories).length,
          desiredJobTitlesCount: safeArray(student.desiredJobTitles).length,
          preferredLocationsCount: safeArray(student.preferredLocations).length,
          preferredWorkModesCount: safeArray(student.preferredWorkModes).length,
          preferredJobTypesCount: safeArray(student.preferredJobTypes).length,
          hasCoordinates:
            Array.isArray(student.location?.coordinates) &&
            student.location.coordinates.length >= 2,
          preferredLevels,
        },
        interactionStats: behaviorProfile.stats,
      },
    });
  } catch (error) {
    console.error('❌ Recommendation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo gợi ý',
      error: error.message,
    });
  }
};