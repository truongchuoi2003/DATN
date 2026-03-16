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

const MAX_APPS_PER_STUDENT = 3;
const RECOMMENDED_WINDOW = 10;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    reset: args.includes('--reset'),
  };
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr = []) {
  if (!arr.length) return null;
  return arr[randomInt(0, arr.length - 1)];
}

function chance(prob) {
  return Math.random() < prob;
}

function shuffle(arr = []) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

function weightedPick(weightedItems = []) {
  const valid = weightedItems.filter((x) => x && x.weight > 0);
  if (!valid.length) return null;

  const total = valid.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;

  for (const item of valid) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }

  return valid[valid.length - 1].value;
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

function buildCoverLetter(student, job) {
  const project = student.projects?.[0] || 'các dự án học tập';
  return `Em quan tâm đến vị trí "${job.title}" vì khá phù hợp với định hướng hiện tại của em. Em đang theo học ngành ${student.major || 'chuyên ngành liên quan'} tại ${student.university || 'trường đại học'} và đã có trải nghiệm với ${project}. Em mong muốn được học hỏi thêm qua công việc thực tế và đóng góp tốt cho đội ngũ.`;
}

function buildEmployerNote(status, job) {
  const templates = {
    reviewing: [
      `Hồ sơ bước đầu phù hợp với vị trí ${job.title}. Đang xem xét thêm kỹ năng và mức độ sẵn sàng làm việc.`,
      `Ứng viên có định hướng tương đối khớp với mô tả công việc. Tiếp tục đánh giá CV.`,
      `CV ổn, cần xem kỹ hơn mức độ phù hợp với yêu cầu vị trí ${job.title}.`,
    ],
    shortlisted: [
      `Ứng viên có hồ sơ nổi bật và phù hợp để đưa vào danh sách shortlist.`,
      `Đánh giá ban đầu tốt, nên ưu tiên liên hệ trong nhóm ứng viên tiềm năng.`,
      `Kỹ năng và định hướng khá khớp với vị trí ${job.title}.`,
    ],
    interviewing: [
      `Ứng viên đã qua vòng lọc hồ sơ và phù hợp để trao đổi sâu hơn trong buổi phỏng vấn.`,
      `Nên phỏng vấn để đánh giá thêm khả năng giao tiếp, thái độ và mức độ phù hợp thực tế.`,
      `Hồ sơ tốt, cần xác nhận thêm kinh nghiệm và định hướng làm việc qua phỏng vấn.`,
    ],
    offered: [
      `Ứng viên thể hiện tốt trong quá trình trao đổi, có thể gửi offer.`,
      `Đánh giá tổng thể tích cực, đủ điều kiện để đề xuất nhận việc.`,
    ],
    hired: [
      `Ứng viên đáp ứng tốt yêu cầu và đã được xác nhận tuyển chính thức.`,
      `Kết quả phỏng vấn tích cực, phù hợp để onboard.`,
    ],
    rejected: [
      `Hồ sơ chưa phù hợp nhất với nhu cầu hiện tại của vị trí ${job.title}.`,
      `Ứng viên chưa đạt mức phù hợp mong muốn cho vòng tiếp theo.`,
      `Tạm thời chưa chọn do còn chênh lệch về mức độ phù hợp với vị trí.`,
    ],
    pending: [
      '',
    ],
  };

  return randomChoice(templates[status] || ['']);
}

function buildMeetingLink(job) {
  const slug = normalizeText(job.title || 'interview')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'interview';

  return `https://meet.google.com/${slug}-${randomInt(100, 999)}`;
}

function buildInterviewData(status, job, employerId, reviewedAt) {
  if (status === 'interviewing') {
    const mode = chance(0.7) ? 'online' : 'offline';
    const scheduledAt = addHours(addDays(reviewedAt, randomInt(1, 4)), randomInt(8, 16));

    return {
      scheduledAt,
      mode,
      location: mode === 'offline' ? 'Văn phòng công ty' : '',
      meetingLink: mode === 'online' ? buildMeetingLink(job) : '',
      note: randomChoice([
        'Chuẩn bị giới thiệu bản thân ngắn gọn và các kỹ năng liên quan.',
        'Buổi phỏng vấn tập trung vào kỹ năng, định hướng và mức độ phù hợp với công việc.',
        'Ứng viên vui lòng tham gia đúng giờ và kiểm tra kết nối trước buổi phỏng vấn.',
      ]),
      status: chance(0.7) ? 'scheduled' : 'accepted',
      scheduledBy: employerId,
      respondedAt: chance(0.45) ? addHours(scheduledAt, -randomInt(8, 24)) : null,
      cancelledAt: null,
    };
  }

  if (status === 'offered' || status === 'hired') {
    const mode = chance(0.65) ? 'online' : 'offline';
    const scheduledAt = addHours(addDays(reviewedAt, -randomInt(1, 4)), randomInt(8, 16));

    return {
      scheduledAt,
      mode,
      location: mode === 'offline' ? 'Văn phòng công ty' : '',
      meetingLink: mode === 'online' ? buildMeetingLink(job) : '',
      note: randomChoice([
        'Buổi phỏng vấn đã hoàn tất, đánh giá tích cực.',
        'Ứng viên thể hiện tốt trong phần trao đổi chuyên môn và thái độ làm việc.',
      ]),
      status: 'completed',
      scheduledBy: employerId,
      respondedAt: addHours(scheduledAt, -randomInt(6, 24)),
      cancelledAt: null,
    };
  }

  if (status === 'rejected' && chance(0.2)) {
    const mode = chance(0.5) ? 'online' : 'offline';
    const scheduledAt = addHours(addDays(reviewedAt, -randomInt(1, 3)), randomInt(8, 16));

    return {
      scheduledAt,
      mode,
      location: mode === 'offline' ? 'Văn phòng công ty' : '',
      meetingLink: mode === 'online' ? buildMeetingLink(job) : '',
      note: 'Lịch phỏng vấn không tiếp tục do chưa phù hợp ở bước đánh giá tiếp theo.',
      status: chance(0.5) ? 'declined' : 'cancelled',
      scheduledBy: employerId,
      respondedAt: chance(0.5) ? addHours(scheduledAt, -randomInt(4, 20)) : null,
      cancelledAt: chance(0.5) ? addHours(scheduledAt, -randomInt(2, 12)) : new Date(),
    };
  }

  return {
    scheduledAt: null,
    mode: 'online',
    location: '',
    meetingLink: '',
    note: '',
    status: 'none',
    scheduledBy: null,
    respondedAt: null,
    cancelledAt: null,
  };
}

function buildApplicationScenario(student, job, scoredJob, status, recommendationRank) {
  const appliedAt = addDays(new Date(), -randomInt(3, 16));
  let reviewedAt = null;
  let updatedAt = appliedAt;

  if (status !== 'pending') {
    reviewedAt = addHours(addDays(appliedAt, randomInt(1, 4)), randomInt(8, 18));
    updatedAt = reviewedAt;
  }

  const interview = buildInterviewData(
    status,
    job,
    job.employer,
    reviewedAt || appliedAt
  );

  if (status === 'interviewing' && interview.scheduledAt) {
    updatedAt = interview.respondedAt || interview.scheduledAt;
  }

  if ((status === 'offered' || status === 'hired') && interview.scheduledAt) {
    updatedAt = addHours(addDays(interview.scheduledAt, randomInt(1, 3)), randomInt(6, 18));
  }

  if (status === 'rejected') {
    updatedAt = addHours(addDays(reviewedAt || appliedAt, randomInt(0, 2)), randomInt(6, 18));
  }

  const salaryMin = Number(student.salaryExpectation?.min || 0);
  const salaryMax = Number(student.salaryExpectation?.max || 0);
  const expectedSalary =
    salaryMin > 0 && salaryMax > 0
      ? randomInt(salaryMin, salaryMax)
      : chance(0.55)
      ? randomInt(2500000, 6000000)
      : null;

  return {
    job: job._id,
    student: student._id,
    employer: job.employer,
    coverLetter: buildCoverLetter(student, job),
    resumeUrl: student.resumeUrl,
    expectedSalary,
    availableFrom: addDays(appliedAt, randomInt(7, 21)),
    additionalInfo: `Seeded application • affinityScore=${scoredJob.score} • recommendationRank=${recommendationRank}`,
    status,
    employerNote: buildEmployerNote(status, job),
    interview,
    reviewedAt,
    appliedAt,
    createdAt: appliedAt,
    updatedAt,
  };
}

function buildApplyInteraction(
  studentId,
  jobId,
  applicationId,
  scoredJob,
  recommendationRank,
  createdAt
) {
  return {
    student: studentId,
    job: jobId,
    interactionType: 'apply',
    source: 'recommendation',
    interactionValue: 5,
    metadata: {
      seeded: true,
      sourceScript: 'seedApplications',
      fromRecommendedJobs: true,
      affinityScore: scoredJob.score,
      recommendationRank,
      applicationId: applicationId.toString(),
    },
    createdAt,
    updatedAt: createdAt,
  };
}

function buildStudentRankings(students, jobs) {
  const result = new Map();

  for (const student of students) {
    const ranked = jobs
      .map((job) => ({
        job,
        jobId: String(job._id),
        employerId: String(job.employer),
        score: scoreStudentJobAffinity(student, job),
      }))
      .sort((a, b) => b.score - a.score);

    const rankMap = new Map(
      ranked.map((item, index) => [item.jobId, index + 1])
    );

    const recommendedJobs = ranked
      .filter((item) => item.score >= 13)
      .slice(0, RECOMMENDED_WINDOW);

    const fallbackRecommended = recommendedJobs.length
      ? recommendedJobs
      : ranked.slice(0, Math.min(RECOMMENDED_WINDOW, ranked.length));

    result.set(String(student._id), {
      ranked,
      rankMap,
      recommendedJobs: fallbackRecommended,
    });
  }

  return result;
}

function buildEmployerPlans(employerIds, totalCapacity) {
  const plans = new Map();
  const baseStatuses = ['interviewing', 'shortlisted', 'reviewing', 'pending'];

  for (const employerId of employerIds) {
    plans.set(String(employerId), [...baseStatuses]);
  }

  let remaining = totalCapacity - employerIds.length * baseStatuses.length;

  const extraPattern = ['offered', 'rejected', 'hired'];
  let i = 0;

  while (remaining > 0 && employerIds.length) {
    const employerId = String(employerIds[i % employerIds.length]);
    plans.get(employerId).unshift(extraPattern[i % extraPattern.length]);
    remaining -= 1;
    i += 1;
  }

  return plans;
}

function buildEmployerCandidatePools(students, employerJobsMap, studentRankings) {
  const pools = new Map();

  for (const [employerId, jobs] of employerJobsMap.entries()) {
    const candidates = [];

    for (const student of students) {
      const ranking = studentRankings.get(String(student._id));
      if (!ranking) continue;

      const recommendedJobIds = new Set(ranking.recommendedJobs.map((x) => x.jobId));

      const preferredInEmployer = ranking.recommendedJobs.filter(
        (x) => x.employerId === employerId
      );

      let chosen = preferredInEmployer[0] || null;

      if (!chosen) {
        const employerScoped = ranking.ranked.filter(
          (x) => x.employerId === employerId
        );
        chosen = employerScoped[0] || null;
      }

      if (!chosen) continue;

      candidates.push({
        student,
        job: chosen.job,
        score: chosen.score,
        recommendationRank: ranking.rankMap.get(chosen.jobId) || 999,
        employerId,
        fromRecommendedWindow: recommendedJobIds.has(chosen.jobId),
      });
    }

    pools.set(
      employerId,
      candidates.sort((a, b) => {
        if (b.fromRecommendedWindow !== a.fromRecommendedWindow) {
          return Number(b.fromRecommendedWindow) - Number(a.fromRecommendedWindow);
        }
        if (b.score !== a.score) return b.score - a.score;
        return a.recommendationRank - b.recommendationRank;
      })
    );
  }

  return pools;
}

function chooseCandidateForStatus(candidates, state, status, employerId, strictUniqueStudent = true) {
  const eligible = candidates.filter((candidate) => {
    const studentId = String(candidate.student._id);
    const jobId = String(candidate.job._id);
    const pairKey = `${studentId}::${jobId}`;

    if (state.usedPairs.has(pairKey)) return false;
    if ((state.studentCounts.get(studentId) || 0) >= MAX_APPS_PER_STUDENT) return false;
    if (strictUniqueStudent && state.employerStudentSets.get(employerId)?.has(studentId)) {
      return false;
    }

    return true;
  });

  if (!eligible.length) return null;

  const strongerStatuses = new Set(['hired', 'offered', 'interviewing']);

  eligible.sort((a, b) => {
    const countA = state.studentCounts.get(String(a.student._id)) || 0;
    const countB = state.studentCounts.get(String(b.student._id)) || 0;

    if (strongerStatuses.has(status)) {
      if (b.score !== a.score) return b.score - a.score;
      if (countA !== countB) return countA - countB;
      return a.recommendationRank - b.recommendationRank;
    }

    if (countA !== countB) return countA - countB;
    if (b.fromRecommendedWindow !== a.fromRecommendedWindow) {
      return Number(b.fromRecommendedWindow) - Number(a.fromRecommendedWindow);
    }
    if (b.score !== a.score) return b.score - a.score;
    return a.recommendationRank - b.recommendationRank;
  });

  return eligible[0];
}

function assignApplicationsByEmployer(students, employerPlans, employerCandidatePools) {
  const assignments = [];
  const state = {
    usedPairs: new Set(),
    studentCounts: new Map(),
    employerStudentSets: new Map(),
  };

  for (const student of students) {
    state.studentCounts.set(String(student._id), 0);
  }

  for (const employerId of employerPlans.keys()) {
    state.employerStudentSets.set(employerId, new Set());
  }

  for (const [employerId, statuses] of employerPlans.entries()) {
    const candidates = employerCandidatePools.get(employerId) || [];
    if (!candidates.length) continue;

    for (const status of statuses) {
      let chosen = chooseCandidateForStatus(candidates, state, status, employerId, true);

      if (!chosen) {
        chosen = chooseCandidateForStatus(candidates, state, status, employerId, false);
      }

      if (!chosen) continue;

      const studentId = String(chosen.student._id);
      const jobId = String(chosen.job._id);
      const pairKey = `${studentId}::${jobId}`;

      assignments.push({
        employerId,
        status,
        student: chosen.student,
        job: chosen.job,
        score: chosen.score,
        recommendationRank: chosen.recommendationRank,
        fromRecommendedWindow: chosen.fromRecommendedWindow,
      });

      state.usedPairs.add(pairKey);
      state.studentCounts.set(studentId, (state.studentCounts.get(studentId) || 0) + 1);
      state.employerStudentSets.get(employerId).add(studentId);
    }
  }

  return { assignments, state };
}

function fillRemainingCapacity(students, jobs, studentRankings, currentState, currentAssignments) {
  const assignments = [...currentAssignments];

  const allCandidates = [];

  for (const student of students) {
    const ranking = studentRankings.get(String(student._id));
    if (!ranking) continue;

    for (const item of ranking.recommendedJobs) {
      allCandidates.push({
        student,
        job: item.job,
        score: item.score,
        recommendationRank: ranking.rankMap.get(item.jobId) || 999,
        employerId: item.employerId,
        fromRecommendedWindow: true,
      });
    }
  }

  allCandidates.sort((a, b) => {
    const countA = currentState.studentCounts.get(String(a.student._id)) || 0;
    const countB = currentState.studentCounts.get(String(b.student._id)) || 0;
    if (countA !== countB) return countA - countB;
    if (b.score !== a.score) return b.score - a.score;
    return a.recommendationRank - b.recommendationRank;
  });

  for (const candidate of allCandidates) {
    const studentId = String(candidate.student._id);
    const jobId = String(candidate.job._id);
    const pairKey = `${studentId}::${jobId}`;

    if (currentState.usedPairs.has(pairKey)) continue;
    if ((currentState.studentCounts.get(studentId) || 0) >= MAX_APPS_PER_STUDENT) continue;

    const status = weightedPick([
      { value: 'pending', weight: 30 },
      { value: 'reviewing', weight: 32 },
      { value: 'shortlisted', weight: 18 },
      { value: 'interviewing', weight: 10 },
      { value: 'rejected', weight: 10 },
    ]);

    assignments.push({
      employerId: String(candidate.job.employer),
      status,
      student: candidate.student,
      job: candidate.job,
      score: candidate.score,
      recommendationRank: candidate.recommendationRank,
      fromRecommendedWindow: true,
    });

    currentState.usedPairs.add(pairKey);
    currentState.studentCounts.set(studentId, (currentState.studentCounts.get(studentId) || 0) + 1);
  }

  return assignments;
}

async function seedApplications({ reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const students = await Student.find({
    email: { $in: SEED_STUDENT_EMAILS.map((e) => e.toLowerCase()) },
  }).select(`
    _id email fullName major university resumeUrl salaryExpectation
    skills preferredLocations preferredCategories preferredJobTypes
    preferredWorkModes desiredJobTitles projectTechnologies projects
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
    _id employer title jobType level location categories requiredSkills
    preferredSkills skills workMode acceptableMajors applicationsCount
  `);

  if (!jobs.length) {
    console.log('⚠️ Không tìm thấy seed jobs hợp lệ. Hãy chạy seedJobs trước.');
    await mongoose.disconnect();
    return;
  }

  const employerJobsMap = new Map();
  for (const job of jobs) {
    const employerId = String(job.employer);
    if (!employerJobsMap.has(employerId)) employerJobsMap.set(employerId, []);
    employerJobsMap.get(employerId).push(job);
  }

  const employerIds = [...employerJobsMap.keys()];
  const studentIds = students.map((s) => s._id);
  const totalCapacity = students.length * MAX_APPS_PER_STUDENT;

  if (reset) {
    const deletedApplications = await Application.deleteMany({
      student: { $in: studentIds },
    });
    const deletedApplyInteractions = await Interaction.deleteMany({
      student: { $in: studentIds },
      interactionType: 'apply',
    });

    console.log(
      `🧹 Reset applications=${deletedApplications.deletedCount}, applyInteractions=${deletedApplyInteractions.deletedCount}`
    );
  } else {
    await Application.deleteMany({ student: { $in: studentIds } });
    await Interaction.deleteMany({
      student: { $in: studentIds },
      interactionType: 'apply',
    });
  }

  const studentRankings = buildStudentRankings(students, jobs);
  const employerPlans = buildEmployerPlans(employerIds, totalCapacity);
  const employerCandidatePools = buildEmployerCandidatePools(
    students,
    employerJobsMap,
    studentRankings
  );

  const { assignments: initialAssignments, state } = assignApplicationsByEmployer(
    students,
    employerPlans,
    employerCandidatePools
  );

  const finalAssignments = fillRemainingCapacity(
    students,
    jobs,
    studentRankings,
    state,
    initialAssignments
  );

  const applicationPayloads = [];
  const interactionPayloads = [];
  const applicationsByJob = new Map();

  for (const item of finalAssignments) {
    const scoredJob = { score: item.score };
    const application = buildApplicationScenario(
      item.student,
      item.job,
      scoredJob,
      item.status,
      item.recommendationRank
    );

    applicationPayloads.push(application);

    const jobId = String(item.job._id);
    applicationsByJob.set(jobId, (applicationsByJob.get(jobId) || 0) + 1);
  }

  const createdApplications = applicationPayloads.length
    ? await Application.insertMany(applicationPayloads, { ordered: false })
    : [];

  const appKeyToDoc = new Map(
    createdApplications.map((doc) => [`${String(doc.student)}::${String(doc.job)}`, doc])
  );

  for (const item of finalAssignments) {
    const key = `${String(item.student._id)}::${String(item.job._id)}`;
    const applicationDoc = appKeyToDoc.get(key);
    if (!applicationDoc) continue;

    interactionPayloads.push(
      buildApplyInteraction(
        item.student._id,
        item.job._id,
        applicationDoc._id,
        { score: item.score },
        item.recommendationRank,
        applicationDoc.appliedAt || applicationDoc.createdAt || new Date()
      )
    );
  }

  if (interactionPayloads.length) {
    await Interaction.insertMany(shuffle(interactionPayloads), { ordered: false });
  }

  const bulkOps = [...applicationsByJob.entries()].map(([jobId, count]) => ({
    updateOne: {
      filter: { _id: jobId },
      update: { $set: { applicationsCount: count } },
    },
  }));

  if (bulkOps.length) {
    await Job.bulkWrite(bulkOps);
  }

  await Job.updateMany(
    {
      categories: 'seed-demo',
      _id: { $nin: [...applicationsByJob.keys()] },
    },
    { $set: { applicationsCount: 0 } }
  );

  const statusSummary = await Application.aggregate([
    { $match: { student: { $in: studentIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const employerSummary = await Application.aggregate([
    { $match: { student: { $in: studentIds } } },
    {
      $group: {
        _id: { employer: '$employer', status: '$status' },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.employer': 1, '_id.status': 1 } },
  ]);

  const studentSummary = await Application.aggregate([
    { $match: { student: { $in: studentIds } } },
    {
      $group: {
        _id: '$student',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const totalApplications = await Application.countDocuments({
    student: { $in: studentIds },
  });

  const totalApplyInteractions = await Interaction.countDocuments({
    student: { $in: studentIds },
    interactionType: 'apply',
  });

  console.log(`🎉 Seed applications xong: applications=${totalApplications}`);
  console.log(`📝 Apply interactions đã tạo: ${totalApplyInteractions}`);
  console.log('📊 Global status summary:', statusSummary);
  console.log('🏢 Employer status summary:', employerSummary);
  console.log('👤 Student application counts:', studentSummary);
  console.log('ℹ️ Seed theo employer: mỗi employer được ưu tiên đủ các nhóm hồ sơ để demo đẹp hơn.');
  console.log('ℹ️ Mỗi student tối đa 3 job và chỉ apply trong nhóm job phù hợp/recommend mạnh.');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { reset } = parseArgs();

seedApplications({ reset }).catch(async (err) => {
  console.error('❌ Lỗi seed applications:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});