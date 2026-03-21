const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Employer = require('../src/models/Employer.model');
const Job = require('../src/models/Job.model');

const CITY_COORDS = {
  'Hà Nội': [105.83416, 21.02776],
  'TP. Hồ Chí Minh': [106.70098, 10.77689],
  'Đà Nẵng': [108.20217, 16.05441],
  'Hải Phòng': [106.68808, 20.84491],
  'Cần Thơ': [105.78309, 10.04516],
};

const CITY_ADDRESSES = {
  'Hà Nội': [
    'Tòa nhà ABC, Cầu Giấy, Hà Nội',
    'Tòa nhà Sông Đà, Nam Từ Liêm, Hà Nội',
    'Nguyễn Chánh, Cầu Giấy, Hà Nội',
  ],
  'TP. Hồ Chí Minh': [
    'Tòa nhà Innovation, TP. Thủ Đức, TP. Hồ Chí Minh',
    'Nguyễn Hữu Cảnh, Bình Thạnh, TP. Hồ Chí Minh',
    'Lê Văn Việt, TP. Thủ Đức, TP. Hồ Chí Minh',
  ],
  'Đà Nẵng': [
    'Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    '2/9, Hải Châu, Đà Nẵng',
    'Hoàng Diệu, Hải Châu, Đà Nẵng',
  ],
  'Hải Phòng': [
    'Lê Hồng Phong, Ngô Quyền, Hải Phòng',
    'Tôn Đức Thắng, Lê Chân, Hải Phòng',
    'Văn Cao, Hải An, Hải Phòng',
  ],
  'Cần Thơ': [
    '30/4, Ninh Kiều, Cần Thơ',
    'Mậu Thân, Ninh Kiều, Cần Thơ',
    'Nguyễn Văn Cừ, Ninh Kiều, Cần Thơ',
  ],
};

const EMPLOYER_JOB_PLANS = [
  {
    email: 'hr1@gmail.com',
    companyName: 'Tech One',
    city: 'TP. Hồ Chí Minh',
    focusTemplates: ['frontend', 'node-backend', 'java-backend', 'qa'],
  },
  {
    email: 'hr2@gmail.com',
    companyName: 'Bright Media',
    city: 'Hà Nội',
    focusTemplates: ['marketing', 'design', 'business-development'],
  },
  {
    email: 'hr3@gmail.com',
    companyName: 'Pixel Studio',
    city: 'Đà Nẵng',
    focusTemplates: ['design', 'frontend', 'marketing'],
  },
  {
    email: 'hr4@gmail.com',
    companyName: 'Office Pro',
    city: 'Hải Phòng',
    focusTemplates: ['operations', 'business-development', 'data'],
  },
  {
    email: 'hr5@gmail.com',
    companyName: 'Mekong Analytics',
    city: 'Cần Thơ',
    focusTemplates: ['data', 'dotnet', 'qa', 'java-backend'],
  },
];

const JOB_TEMPLATES = {
  frontend: {
    titles: [
      'Frontend Intern',
      'Thực tập Frontend Developer',
      'Web Frontend Intern',
      'Part-time Frontend Developer',
    ],
    categories: ['IT', 'Frontend', 'Web'],
    acceptableMajors: ['Công nghệ thông tin', 'Hệ thống thông tin'],
    skills: ['javascript', 'html', 'css', 'vue', 'git', 'responsive design'],
    description:
      'Tham gia phát triển giao diện web, phối hợp cùng backend và design để hoàn thiện các module sản phẩm.',
    requirements:
      'Nắm HTML, CSS, JavaScript; biết Vue là lợi thế, có khả năng cắt giao diện responsive.',
    benefits:
      'Có mentor review code, học Git workflow và có cơ hội tiếp tục gắn bó sau kỳ thực tập.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [4000000, 9000000],
    targetCities: ['TP. Hồ Chí Minh', 'Đà Nẵng', 'Hà Nội'],
    workModes: ['hybrid', 'remote'],
  },

  'node-backend': {
    titles: [
      'Backend Developer Intern',
      'Node.js API Intern',
      'Part-time Node.js Developer',
      'Backend Intern (Express)',
    ],
    categories: ['IT', 'Backend', 'API'],
    acceptableMajors: ['Công nghệ thông tin', 'Hệ thống thông tin'],
    skills: ['nodejs', 'express', 'mongodb', 'api', 'javascript', 'git'],
    description:
      'Tham gia xây dựng API, xử lý dữ liệu và hỗ trợ backend cho website nội bộ.',
    requirements:
      'Biết Node.js, Express, MongoDB cơ bản; hiểu REST API và có khả năng đọc tài liệu kỹ thuật.',
    benefits:
      'Được training backend thực chiến, review code định kỳ và hướng dẫn deploy cơ bản.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [4500000, 10000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội'],
    workModes: ['hybrid', 'onsite'],
  },

  'java-backend': {
    titles: [
      'Java Backend Intern',
      'Java Spring Intern',
      'Junior Java Developer',
      'Backend Java/Spring Fresher',
    ],
    categories: ['IT', 'Backend', 'API'],
    acceptableMajors: ['Công nghệ thông tin', 'Hệ thống thông tin'],
    skills: ['java', 'spring', 'spring boot', 'sql', 'git', 'docker'],
    description:
      'Xây dựng API bằng Java/Spring Boot, hỗ trợ database và phát triển các module backend.',
    requirements:
      'Nắm Java core, OOP, SQL; biết Spring hoặc Spring Boot là lợi thế lớn.',
    benefits:
      'Được tham gia dự án nội bộ, học quy trình backend và có cơ hội lên fresher.',
    jobTypes: ['internship', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [6000000, 15000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Cần Thơ'],
    workModes: ['onsite', 'hybrid'],
  },

  dotnet: {
    titles: [
      '.NET Developer Intern',
      'C# Developer Intern',
      'Software Engineer Intern',
      'Junior .NET Developer',
    ],
    categories: ['IT', 'Backend', 'Software'],
    acceptableMajors: ['Hệ thống thông tin', 'Công nghệ thông tin'],
    skills: ['c#', '.net', 'asp.net', 'sql', 'winforms', 'git'],
    description:
      'Phát triển phần mềm nội bộ bằng C#/.NET, hỗ trợ xử lý dữ liệu và bảo trì các module hiện có.',
    requirements:
      'Biết C#, OOP, SQL; có kiến thức .NET hoặc WinForms/ASP.NET là điểm cộng.',
    benefits:
      'Được làm việc với sản phẩm thật, có mentor hướng dẫn và quy trình rõ ràng.',
    jobTypes: ['internship', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [5500000, 14500000],
    targetCities: ['Cần Thơ', 'TP. Hồ Chí Minh', 'Hà Nội'],
    workModes: ['onsite', 'hybrid'],
  },

  qa: {
    titles: [
      'QA Tester Intern',
      'Manual Tester Intern',
      'Tester Fresher',
      'Part-time QA Support',
    ],
    categories: ['IT', 'QA', 'Testing'],
    acceptableMajors: ['Công nghệ thông tin', 'Hệ thống thông tin'],
    skills: ['testing', 'testcase', 'bug-report', 'jira', 'excel'],
    description:
      'Hỗ trợ kiểm thử chức năng website/app, viết test case và phối hợp cùng dev để xử lý lỗi.',
    requirements:
      'Cẩn thận, tư duy logic tốt, biết viết test case hoặc bug report là lợi thế.',
    benefits:
      'Được training quy trình QA, tham gia dự án thật và học cách quản lý lỗi bài bản.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3500000, 8000000],
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'],
    workModes: ['onsite', 'hybrid'],
  },

  data: {
    titles: [
      'Data Analyst Intern',
      'BI Analyst Intern',
      'Power BI Intern',
      'Data Reporting Intern',
    ],
    categories: ['Data', 'Data Analyst', 'BI'],
    acceptableMajors: ['Khoa học dữ liệu', 'Công nghệ thông tin', 'Hệ thống thông tin'],
    skills: ['python', 'pandas', 'sql', 'excel', 'power bi', 'dashboard'],
    description:
      'Hỗ trợ làm sạch dữ liệu, xây dashboard, trực quan hóa số liệu và tạo báo cáo cho bộ phận kinh doanh.',
    requirements:
      'Biết Excel tốt, có nền tảng SQL; biết Power BI hoặc Python là điểm cộng lớn.',
    benefits:
      'Được hướng dẫn trực quan hóa dữ liệu, làm dashboard thật và học quy trình báo cáo số liệu.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [4500000, 11000000],
    targetCities: ['Hải Phòng', 'Hà Nội', 'TP. Hồ Chí Minh', 'Cần Thơ'],
    workModes: ['remote', 'hybrid'],
  },

  marketing: {
    titles: [
      'Content Marketing Intern',
      'Social Media Intern',
      'Marketing Intern',
      'Part-time Digital Marketing',
    ],
    categories: ['Marketing', 'Content', 'Digital'],
    acceptableMajors: ['Marketing', 'Quản trị kinh doanh'],
    skills: ['marketing', 'content', 'seo', 'facebook ads', 'canva', 'tiktok'],
    description:
      'Hỗ trợ triển khai nội dung social media, tối ưu bài viết và theo dõi hiệu quả chiến dịch marketing.',
    requirements:
      'Yêu thích sáng tạo nội dung, biết Canva; hiểu SEO hoặc social media là điểm cộng.',
    benefits:
      'Làm việc linh hoạt, có thể hỗ trợ dấu mộc thực tập và được hướng dẫn làm content thực chiến.',
    jobTypes: ['internship', 'part-time', 'freelance'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 8500000],
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    workModes: ['onsite', 'hybrid'],
  },

  design: {
    titles: [
      'UI/UX Intern',
      'Graphic Designer Intern',
      'Design Intern',
      'Part-time Designer',
    ],
    categories: ['Design', 'UI/UX', 'Creative'],
    acceptableMajors: ['Thiết kế đồ họa', 'Công nghệ thông tin'],
    skills: ['figma', 'photoshop', 'canva', 'design', 'ui', 'ux'],
    description:
      'Thiết kế giao diện cơ bản cho web/app và hỗ trợ làm ấn phẩm truyền thông số cho dự án.',
    requirements:
      'Biết Figma hoặc Photoshop, có tư duy bố cục và màu sắc tốt, có portfolio là lợi thế.',
    benefits:
      'Môi trường sáng tạo, có feedback thường xuyên và cơ hội tham gia nhiều đầu việc thực tế.',
    jobTypes: ['internship', 'part-time', 'freelance'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 9000000],
    targetCities: ['Đà Nẵng', 'TP. Hồ Chí Minh', 'Hà Nội'],
    workModes: ['remote', 'hybrid'],
  },

  operations: {
    titles: [
      'Business Operations Intern',
      'Operations Intern',
      'Sales Admin Intern',
      'Business Support Intern',
    ],
    categories: ['Business', 'Operations', 'Sales'],
    acceptableMajors: ['Quản trị kinh doanh', 'Marketing'],
    skills: ['excel', 'reporting', 'communication', 'teamwork', 'presentation'],
    description:
      'Hỗ trợ tổng hợp dữ liệu, làm báo cáo, chuẩn bị tài liệu và phối hợp vận hành nội bộ.',
    requirements:
      'Sử dụng Excel khá, giao tiếp tốt, cẩn thận và có khả năng phối hợp công việc nhóm.',
    benefits:
      'Học quy trình vận hành doanh nghiệp, được đào tạo cách lập báo cáo và theo dõi công việc.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 8000000],
    targetCities: ['Hà Nội', 'Hải Phòng', 'TP. Hồ Chí Minh'],
    workModes: ['onsite', 'hybrid'],
  },

  'business-development': {
    titles: [
      'Business Development Intern',
      'Part-time Sales Support',
      'Sales Admin Intern',
      'Customer Support Intern',
    ],
    categories: ['Business', 'Sales', 'Operations'],
    acceptableMajors: ['Quản trị kinh doanh', 'Marketing'],
    skills: ['communication', 'sales', 'excel', 'reporting', 'teamwork'],
    description:
      'Hỗ trợ chăm sóc khách hàng, tổng hợp dữ liệu bán hàng và hỗ trợ bộ phận phát triển kinh doanh.',
    requirements:
      'Giao tiếp tốt, nhanh nhẹn, biết Excel cơ bản và có tinh thần học hỏi.',
    benefits:
      'Được học quy trình sales thực tế, phối hợp nhiều phòng ban và cải thiện kỹ năng làm việc.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 8500000],
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Cần Thơ'],
    workModes: ['onsite', 'hybrid'],
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const reset = args.includes('--reset');
  const countArg = args.find((a) => a.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : 40;

  return {
    reset,
    count: Number.isFinite(count) ? Math.max(10, count) : 40,
  };
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function jitterCoordinates([lng, lat], range = 0.03) {
  const lngOffset = (Math.random() - 0.5) * range;
  const latOffset = (Math.random() - 0.5) * range;

  return [
    Number((lng + lngOffset).toFixed(6)),
    Number((lat + latOffset).toFixed(6)),
  ];
}

function uniqueArray(arr = []) {
  return [...new Set(arr.map((x) => String(x || '').trim()).filter(Boolean))];
}

function pickByIndex(arr = [], index = 0) {
  return arr[index % arr.length];
}

function buildAddress(city, companyName, localIndex) {
  const pool = CITY_ADDRESSES[city] || [city];
  const base = pool[localIndex % pool.length];
  return `${companyName}, ${base}`;
}

function buildWorkMode(template, localIndex) {
  return pickByIndex(template.workModes, localIndex);
}

function buildSalary([minBase, maxBase], jobType, level) {
  let min = minBase;
  let max = maxBase;

  if (jobType === 'part-time') {
    min = Math.round(min * 0.8);
    max = Math.round(max * 0.8);
  }

  if (jobType === 'freelance') {
    min = Math.round(min * 0.85);
    max = Math.round(max * 0.95);
  }

  if (level === 'junior') {
    min = Math.round(min * 1.15);
    max = Math.round(max * 1.2);
  }

  return {
    min,
    max,
    currency: 'VND',
    negotiable: false,
  };
}

function splitSkillsForJob(skills = [], localIndex = 0) {
  const ordered = [...skills];
  const rotate = ordered.length ? localIndex % ordered.length : 0;
  const rotated = [...ordered.slice(rotate), ...ordered.slice(0, rotate)];
  const uniq = uniqueArray(rotated);

  const requiredSkills = uniq.slice(0, Math.min(4, uniq.length));
  const preferredSkills = uniq.slice(Math.min(4, uniq.length), Math.min(6, uniq.length));
  const allSkills = uniqueArray([...requiredSkills, ...preferredSkills]);

  return {
    skills: allSkills,
    requiredSkills,
    preferredSkills: preferredSkills.length ? preferredSkills : uniq.slice(-2),
  };
}

async function loadDemoEmployers() {
  const emails = EMPLOYER_JOB_PLANS.map((x) => x.email.toLowerCase());

  const employers = await Employer.find({
    email: { $in: emails },
  }).select('_id companyName email location');

  if (!employers.length) {
    throw new Error('Không có employer demo để seed job. Hãy chạy seedEmployers trước.');
  }

  const employerMap = new Map(
    employers.map((emp) => [emp.email.toLowerCase(), emp])
  );

  const merged = EMPLOYER_JOB_PLANS.map((seed) => ({
    ...seed,
    employerDoc: employerMap.get(seed.email.toLowerCase()),
  })).filter((x) => x.employerDoc);

  if (!merged.length) {
    throw new Error('Không map được employer demo nào để seed job. Hãy kiểm tra email employer.');
  }

  return merged;
}

function buildEmployerJobPlan(employers, count) {
  const plan = [];
  const totalEmployers = employers.length;
  const basePerEmployer = Math.floor(count / totalEmployers);
  let remainder = count % totalEmployers;

  for (const employer of employers) {
    const quota = basePerEmployer + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;

    for (let i = 0; i < quota; i += 1) {
      plan.push({
        employer,
        localIndex: i,
      });
    }
  }

  return plan;
}

function generateOneJob({ employerSeed, localIndex, globalIndex }) {
  const templateCode =
    employerSeed.focusTemplates[localIndex % employerSeed.focusTemplates.length];
  const template = JOB_TEMPLATES[templateCode];

  if (!template) {
    throw new Error(`Không tìm thấy JOB_TEMPLATES cho mã: ${templateCode}`);
  }

  const title = `${pickByIndex(template.titles, localIndex)} #${globalIndex + 1}`;
  const jobType = pickByIndex(template.jobTypes, localIndex);
  const level = pickByIndex(template.levels, localIndex);
  const experience = pickByIndex(template.experiences, localIndex);

  const cities = uniqueArray([employerSeed.city, ...template.targetCities]);
  const city = pickByIndex(cities, localIndex);

  const workMode = buildWorkMode(template, localIndex);
  const skillSet = splitSkillsForJob(template.skills, localIndex);

  const createdAt = addDays(new Date(), -(globalIndex % 14));
  const deadline = addDays(new Date(), 20 + (globalIndex % 25));

  return {
    employer: employerSeed.employerDoc._id,
    title,
    description: template.description,
    requirements: template.requirements,
    benefits: template.benefits,
    acceptableMajors: uniqueArray(template.acceptableMajors),
    workMode,
    location: {
      address: buildAddress(city, employerSeed.companyName, localIndex),
      city,
      coordinates: jitterCoordinates(CITY_COORDS[city]),
    },
    salary: buildSalary(template.salaryRange, jobType, level),
    jobType,
    level,
    experience,
    skills: skillSet.skills,
    requiredSkills: skillSet.requiredSkills,
    preferredSkills: skillSet.preferredSkills,
    categories: uniqueArray([...template.categories, 'seed-demo']),
    deadline,
    slots: randomInt(1, 4),
    status: 'active',
    isVerified: true,
    views: 0,
    applicationsCount: 0,
    createdAt,
    updatedAt: createdAt,
  };
}

function buildBalancedJobs(employers, count) {
  const plan = buildEmployerJobPlan(employers, count);
  const jobs = [];

  plan.forEach((item, index) => {
    jobs.push(
      generateOneJob({
        employerSeed: item.employer,
        localIndex: item.localIndex,
        globalIndex: index,
      })
    );
  });

  return jobs;
}

async function seedJobs({ count = 40, reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const employers = await loadDemoEmployers();

  if (reset) {
    const rs = await Job.deleteMany({
      categories: 'seed-demo',
    });
    console.log(`🧹 Đã xoá ${rs.deletedCount} seed jobs cũ`);
  }

  const jobs = buildBalancedJobs(employers, count);
  const result = await Job.insertMany(jobs, { ordered: false });

  const summary = result.reduce((acc, job) => {
    const key = String(job.employer);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  console.log(`🎉 Seed job xong | created: ${result.length}`);
  console.log(`🏢 Employers dùng để seed: ${employers.length}`);
  console.log('📌 Toàn bộ job seed đều: active + verified + còn hạn + applicationsCount = 0');
  console.log('📊 Số job theo employer:', summary);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { count, reset } = parseArgs();

seedJobs({ count, reset }).catch(async (err) => {
  console.error('❌ Lỗi seed jobs:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});