const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Report = require('../src/models/Report.model');
const Student = require('../src/models/Student.model');
const Employer = require('../src/models/Employer.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');

const TARGET_MODES = ['student_job', 'student_employer', 'employer_candidate'];

const REASON_POOLS = {
  job: [
    'fake_information',
    'spam',
    'inappropriate_content',
    'fraud',
    'other',
  ],
  employer: [
    'unprofessional_behavior',
    'fraud',
    'harassment',
    'fake_information',
    'other',
  ],
  student: [
    'unprofessional_behavior',
    'harassment',
    'spam',
    'other',
  ],
};

function parseArgs() {
  const args = process.argv.slice(2);
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : 20;

  return {
    count: Number.isFinite(count) && count > 0 ? count : 20,
    reset: args.includes('--reset'),
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr = []) {
  if (!Array.isArray(arr) || !arr.length) return null;
  return arr[randomInt(0, arr.length - 1)];
}

function chance(probability) {
  return Math.random() < probability;
}

function pickReasonByTarget(targetType) {
  const pool = REASON_POOLS[targetType] || ['other'];
  return randomChoice(pool);
}

function buildStatus() {
  const roll = Math.random();

  if (roll < 0.5) return 'open';
  if (roll < 0.72) return 'in_review';
  if (roll < 0.9) return 'resolved';
  return 'dismissed';
}

function buildAdminNote(status) {
  if (status === 'open') return '[seed-report]';
  return `[seed-report] | ${status}`;
}

function buildDescription({ reason, targetType, targetName, jobTitle }) {
  const safeTargetName = targetName || 'đối tượng này';
  const safeJobTitle = jobTitle || 'vị trí này';

  const templates = {
    job: {
      fake_information: [
        `Tin tuyển dụng "${safeJobTitle}" có thông tin về mức lương và mô tả công việc không trùng với nội dung được trao đổi sau khi ứng tuyển.`,
        `Bài đăng "${safeJobTitle}" ghi yêu cầu công việc chưa rõ ràng, một số thông tin quan trọng như thời gian làm việc và quyền lợi bị mô tả không đúng.`,
        `Nội dung tuyển dụng "${safeJobTitle}" có dấu hiệu ghi sai thông tin thực tế về công việc và điều kiện làm việc.`,
      ],
      spam: [
        `Tin tuyển dụng "${safeJobTitle}" được đăng lặp lại nhiều lần với nội dung gần như giống nhau, gây nhiễu khi tìm việc.`,
        `Bài đăng "${safeJobTitle}" có dấu hiệu spam vì xuất hiện trùng nội dung với nhiều tin khác trong thời gian ngắn.`,
        `Tin "${safeJobTitle}" có nội dung sơ sài, đăng lặp và không cung cấp đủ thông tin cần thiết cho ứng viên.`,
      ],
      inappropriate_content: [
        `Bài đăng "${safeJobTitle}" sử dụng ngôn từ không phù hợp trong phần mô tả công việc.`,
        `Nội dung của tin "${safeJobTitle}" có câu chữ thiếu chuyên nghiệp và không phù hợp với môi trường tuyển dụng sinh viên.`,
        `Tin tuyển dụng "${safeJobTitle}" có thông tin trình bày phản cảm hoặc không phù hợp để hiển thị công khai.`,
      ],
      fraud: [
        `Tin tuyển dụng "${safeJobTitle}" yêu cầu ứng viên chuyển khoản hoặc nộp phí trước khi nhận việc.`,
        `Bài đăng "${safeJobTitle}" có dấu hiệu lừa đảo vì yêu cầu cung cấp thông tin cá nhân nhạy cảm không liên quan đến tuyển dụng.`,
        `Tin "${safeJobTitle}" có dấu hiệu không minh bạch trong quy trình tuyển dụng và yêu cầu bất thường từ ứng viên.`,
      ],
      other: [
        `Tin tuyển dụng "${safeJobTitle}" có một số thông tin chưa rõ ràng, dễ gây hiểu nhầm cho sinh viên khi ứng tuyển.`,
        `Bài đăng "${safeJobTitle}" cần được kiểm tra thêm vì nội dung chưa đầy đủ và thiếu minh bạch.`,
        `Tin "${safeJobTitle}" có dấu hiệu bất thường nên cần admin rà soát lại.`,
      ],
    },

    employer: {
      unprofessional_behavior: [
        `Nhà tuyển dụng ${safeTargetName} phản hồi chậm, thay đổi lịch phỏng vấn nhiều lần và làm ảnh hưởng đến ứng viên.`,
        `Quá trình trao đổi với ${safeTargetName} thiếu chuyên nghiệp, nội dung phản hồi không rõ ràng và không nhất quán.`,
        `${safeTargetName} có cách làm việc thiếu chuyên nghiệp trong quá trình tiếp nhận và xử lý hồ sơ.`,
      ],
      fraud: [
        `Nhà tuyển dụng ${safeTargetName} có dấu hiệu yêu cầu ứng viên đóng phí hoặc đặt cọc trước khi nhận việc.`,
        `${safeTargetName} cung cấp thông tin tuyển dụng không minh bạch và có dấu hiệu lợi dụng ứng viên.`,
        `Có dấu hiệu bất thường từ ${safeTargetName} trong quá trình tuyển dụng, cần kiểm tra để tránh rủi ro cho sinh viên.`,
      ],
      harassment: [
        `Trong quá trình trao đổi, ${safeTargetName} có lời lẽ gây khó chịu và vượt quá phạm vi giao tiếp tuyển dụng thông thường.`,
        `${safeTargetName} liên hệ ngoài mục đích tuyển dụng và khiến ứng viên cảm thấy bị làm phiền.`,
        `Cách nhắn tin hoặc trao đổi từ ${safeTargetName} có dấu hiệu quấy rối, cần được xem xét.`,
      ],
      fake_information: [
        `${safeTargetName} đăng thông tin tuyển dụng nhưng khi trao đổi thực tế thì quyền lợi và yêu cầu công việc không đúng như bài đăng.`,
        `Thông tin do ${safeTargetName} cung cấp có điểm không khớp giữa bài đăng và nội dung trao đổi với ứng viên.`,
        `${safeTargetName} có dấu hiệu đưa thông tin chưa chính xác về vị trí tuyển dụng và điều kiện làm việc.`,
      ],
      other: [
        `${safeTargetName} có dấu hiệu bất thường trong quá trình tuyển dụng nên cần được admin kiểm tra thêm.`,
        `Có phản ánh về ${safeTargetName} liên quan đến trải nghiệm tuyển dụng chưa rõ ràng.`,
        `Quá trình làm việc với ${safeTargetName} phát sinh vấn đề cần được xem xét thêm.`,
      ],
    },

    student: {
      unprofessional_behavior: [
        `Ứng viên ${safeTargetName} đã xác nhận lịch phỏng vấn nhưng không tham gia và không có phản hồi trước.`,
        `${safeTargetName} nộp hồ sơ rồi ngừng phản hồi trong quá trình tuyển dụng, gây gián đoạn cho nhà tuyển dụng.`,
        `Ứng viên ${safeTargetName} có thái độ thiếu chuyên nghiệp trong quá trình trao đổi về vị trí "${safeJobTitle}".`,
      ],
      harassment: [
        `Ứng viên ${safeTargetName} có cách trao đổi không phù hợp, gây khó chịu cho phía tuyển dụng.`,
        `${safeTargetName} liên hệ nhiều lần với nội dung ngoài phạm vi tuyển dụng và gây phiền hà.`,
        `Cách giao tiếp của ứng viên ${safeTargetName} trong quá trình ứng tuyển có dấu hiệu quấy rối.`,
      ],
      spam: [
        `Ứng viên ${safeTargetName} gửi nhiều hồ sơ trùng lặp hoặc liên hệ lặp lại không cần thiết cho cùng một vị trí.`,
        `${safeTargetName} thực hiện ứng tuyển lặp nhiều lần cho cùng một job, gây nhiễu trong quá trình xử lý.`,
        `Có dấu hiệu spam từ ứng viên ${safeTargetName} trong quá trình nộp hồ sơ.`,
      ],
      other: [
        `Ứng viên ${safeTargetName} có phát sinh vấn đề trong quá trình ứng tuyển, cần admin kiểm tra thêm.`,
        `Có phản ánh liên quan đến ứng viên ${safeTargetName} nhưng cần được xác minh thêm.`,
        `Hồ sơ hoặc cách ứng tuyển của ${safeTargetName} có điểm bất thường cần rà soát.`,
      ],
    },
  };

  const group = templates[targetType] || templates.job;
  const list = group[reason] || group.other;
  return randomChoice(list);
}

function buildEvidenceUrls(index) {
  if (!chance(0.3)) return [];
  return [`https://evidence.demo.local/report-${Date.now()}-${index}`];
}

function getEmployerDisplayName(employer) {
  return employer?.companyName || employer?.fullName || employer?.email || 'nhà tuyển dụng này';
}

function getStudentDisplayName(student) {
  return student?.fullName || student?.email || 'ứng viên này';
}

async function seedReports({ count = 20, reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const [students, employers, jobs, applications] = await Promise.all([
    Student.find().select('_id fullName email').lean(),
    Employer.find().select('_id fullName companyName email').lean(),
    Job.find().select('_id title employer').lean(),
    Application.find().select('_id student employer job').lean(),
  ]);

  if (!students.length) {
    throw new Error('Không có dữ liệu Student để seed report');
  }

  if (!employers.length) {
    throw new Error('Không có dữ liệu Employer để seed report');
  }

  if (!jobs.length) {
    throw new Error('Không có dữ liệu Job để seed report');
  }

  if (reset) {
    const deleted = await Report.deleteMany({ adminNote: /\[seed-report\]/i });
    console.log(`🧹 Đã xóa ${deleted.deletedCount} report seed cũ`);
  }

  const studentById = new Map(students.map((item) => [String(item._id), item]));
  const employerById = new Map(employers.map((item) => [String(item._id), item]));
  const jobById = new Map(jobs.map((item) => [String(item._id), item]));

  const jobsByEmployerId = new Map();
  for (const job of jobs) {
    const employerId = String(job.employer);
    if (!jobsByEmployerId.has(employerId)) {
      jobsByEmployerId.set(employerId, []);
    }
    jobsByEmployerId.get(employerId).push(job);
  }

  const validApplications = applications.filter(
    (app) => app.student && app.employer && app.job
  );

  const docs = [];
  let attempts = 0;
  const maxAttempts = Math.max(count * 10, 100);

  while (docs.length < count && attempts < maxAttempts) {
    attempts += 1;

    let mode = randomChoice(TARGET_MODES);

    if (mode === 'employer_candidate' && !validApplications.length) {
      mode = randomChoice(['student_job', 'student_employer']);
    }

    if (mode === 'student_job') {
      const student = randomChoice(students);
      const job = randomChoice(jobs);

      if (!student || !job) continue;

      const reason = pickReasonByTarget('job');
      const status = buildStatus();

      docs.push({
        reporterRole: 'student',
        reporterId: student._id,
        reporterModel: 'Student',

        targetType: 'job',
        targetId: job._id,
        targetModel: 'Job',

        relatedJob: job._id,
        relatedApplication: null,

        reason,
        description: buildDescription({
          reason,
          targetType: 'job',
          targetName: job.title,
          jobTitle: job.title,
        }),
        evidenceUrls: buildEvidenceUrls(docs.length),
        status,
        adminNote: buildAdminNote(status),
        handledAt: status === 'open' ? null : new Date(),
      });

      continue;
    }

    if (mode === 'student_employer') {
      const student = randomChoice(students);
      const employer = randomChoice(employers);

      if (!student || !employer) continue;

      const employerJobs = jobsByEmployerId.get(String(employer._id)) || [];
      const relatedJob = employerJobs.length && chance(0.75)
        ? randomChoice(employerJobs)._id
        : null;

      const referenceJob = relatedJob ? jobById.get(String(relatedJob)) : null;
      const reason = pickReasonByTarget('employer');
      const status = buildStatus();

      docs.push({
        reporterRole: 'student',
        reporterId: student._id,
        reporterModel: 'Student',

        targetType: 'employer',
        targetId: employer._id,
        targetModel: 'Employer',

        relatedJob,
        relatedApplication: null,

        reason,
        description: buildDescription({
          reason,
          targetType: 'employer',
          targetName: getEmployerDisplayName(employer),
          jobTitle: referenceJob?.title || '',
        }),
        evidenceUrls: buildEvidenceUrls(docs.length),
        status,
        adminNote: buildAdminNote(status),
        handledAt: status === 'open' ? null : new Date(),
      });

      continue;
    }

    const application = randomChoice(validApplications);
    if (!application) continue;

    const employer = employerById.get(String(application.employer));
    const student = studentById.get(String(application.student));
    const job = jobById.get(String(application.job));

    if (!employer || !student || !job) continue;

    const reason = pickReasonByTarget('student');
    const status = buildStatus();

    docs.push({
      reporterRole: 'employer',
      reporterId: employer._id,
      reporterModel: 'Employer',

      targetType: 'student',
      targetId: student._id,
      targetModel: 'Student',

      relatedJob: job._id,
      relatedApplication: application._id,

      reason,
      description: buildDescription({
        reason,
        targetType: 'student',
        targetName: getStudentDisplayName(student),
        jobTitle: job.title,
      }),
      evidenceUrls: buildEvidenceUrls(docs.length),
      status,
      adminNote: buildAdminNote(status),
      handledAt: status === 'open' ? null : new Date(),
    });
  }

  if (!docs.length) {
    console.log('⚠️ Không tạo được report nào');
    await mongoose.disconnect();
    return;
  }

  const inserted = await Report.insertMany(docs, { ordered: false });
  console.log(`✅ Đã seed ${inserted.length} reports`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt MongoDB');
}

seedReports(parseArgs()).catch(async (error) => {
  console.error('❌ Seed reports thất bại:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});