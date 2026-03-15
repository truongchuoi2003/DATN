const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Job = require('../src/models/Job.model');
const Employer = require('../src/models/Employer.model');

const DEMO_EMPLOYER_EMAILS = [
  'hr1@gmail.com',
  'hr2@gmail.com',
  'hr3@gmail.com',
  'hr4@gmail.com',
  'hr5@gmail.com',
];

const CITY_COORDS = {
  'Hà Nội': [105.83416, 21.02776],
  'TP. Hồ Chí Minh': [106.70098, 10.77689],
  'Đà Nẵng': [108.20217, 16.05441],
  'Hải Phòng': [106.68808, 20.84491],
  'Cần Thơ': [105.78309, 10.04516],
};

const DISTRICTS_BY_CITY = {
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Thanh Xuân', 'Nam Từ Liêm'],
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận Bình Thạnh', 'Quận 7', 'TP. Thủ Đức', 'Phú Nhuận'],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'],
  'Hải Phòng': ['Lê Chân', 'Ngô Quyền', 'Hồng Bàng', 'Kiến An'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn'],
};

function randomItem(arr = []) {
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

function jitterCoordinates([lng, lat], range = 0.02) {
  const lngOffset = (Math.random() - 0.5) * range;
  const latOffset = (Math.random() - 0.5) * range;
  return [Number((lng + lngOffset).toFixed(6)), Number((lat + latOffset).toFixed(6))];
}

function splitSkillsForJob(skills) {
  const uniqueSkills = [...new Set((skills || []).map((x) => String(x).trim()).filter(Boolean))];

  if (uniqueSkills.length <= 3) {
    return {
      skills: uniqueSkills,
      requiredSkills: uniqueSkills,
      preferredSkills: [],
    };
  }

  const requiredSkills = uniqueSkills.slice(0, 4);
  const preferredSkills = uniqueSkills.slice(4);

  return {
    skills: uniqueSkills,
    requiredSkills,
    preferredSkills,
  };
}

function buildAddress(city) {
  const district = randomItem(DISTRICTS_BY_CITY[city] || ['Trung tâm']);
  return `${district}, ${city}`;
}

function buildSalary([minBase, maxBase], jobType, level) {
  let min = minBase;
  let max = maxBase;

  if (jobType === 'part-time') {
    min = Math.max(2500000, Math.round(minBase * 0.7));
    max = Math.max(min + 1000000, Math.round(maxBase * 0.75));
  }

  if (jobType === 'internship') {
    min = Math.max(2500000, Math.round(minBase * 0.75));
    max = Math.max(min + 1500000, Math.round(maxBase * 0.8));
  }

  if (level === 'junior') {
    min += 1000000;
    max += 2000000;
  }

  return {
    min,
    max,
    currency: 'VND',
    negotiable: false,
  };
}

function buildWorkMode(jobType, preferredModes = []) {
  if (preferredModes.length) return randomItem(preferredModes);
  if (jobType === 'part-time') return Math.random() < 0.5 ? 'hybrid' : 'onsite';
  if (jobType === 'internship') return Math.random() < 0.25 ? 'remote' : 'hybrid';
  return 'onsite';
}

function buildAcceptableMajors(template) {
  return [...new Set([...(template.acceptableMajors || []), ...(template.extraMajors || [])])];
}

const JOB_TEMPLATES = [
  {
    code: 'frontend',
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
      'Tham gia phát triển giao diện web, làm việc cùng backend và designer để hoàn thiện các module của sản phẩm.',
    requirements:
      'Có kiến thức HTML, CSS, JavaScript; biết Vue là lợi thế, có khả năng cắt giao diện responsive.',
    benefits:
      'Có mentor review code, được hướng dẫn Git workflow và có cơ hội lên thực tập sinh chính thức lâu dài.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [4000000, 9000000],
    targetCities: ['TP. Hồ Chí Minh', 'Đà Nẵng', 'Hà Nội'],
    workModes: ['hybrid', 'remote'],
  },
  {
    code: 'node-backend',
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
      'Biết Node.js, Express, MongoDB cơ bản, hiểu REST API và có khả năng đọc tài liệu kỹ thuật.',
    benefits:
      'Được training backend thực chiến, có review code định kỳ và hướng dẫn deploy cơ bản.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [4500000, 10000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội'],
    workModes: ['hybrid', 'onsite'],
  },
  {
    code: 'java-backend',
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
      'Xây dựng API bằng Java/Spring Boot, hỗ trợ xử lý database và phát triển các module backend.',
    requirements:
      'Nắm Java core, OOP, SQL; biết Spring hoặc Spring Boot là một lợi thế lớn.',
    benefits:
      'Được tham gia dự án nội bộ, học quy trình backend và cơ hội lên fresher nếu làm tốt.',
    jobTypes: ['internship', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [6000000, 15000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội'],
    workModes: ['onsite', 'hybrid'],
  },
  {
    code: 'dotnet',
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
  {
    code: 'qa',
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
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
    workModes: ['onsite', 'hybrid'],
  },
  {
    code: 'data',
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
    targetCities: ['Hải Phòng', 'Hà Nội', 'TP. Hồ Chí Minh'],
    workModes: ['remote', 'hybrid'],
  },
  {
    code: 'marketing',
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
  {
    code: 'design',
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
  {
    code: 'operations',
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
  {
    code: 'business-development',
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
];

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

async function ensureDemoEmployers() {
  const demoEmployers = [
    {
      fullName: 'HR Tech One',
      email: 'hr1@gmail.com',
      password: '123456',
      phone: '0900000001',
      address: 'TP. Thủ Đức, TP. Hồ Chí Minh',
      companyName: 'Tech One',
      companySize: '11-50',
      industry: 'Công nghệ',
      website: 'https://techone.example.com',
      description: 'Công ty công nghệ chuyên tuyển thực tập sinh và fresher ngành IT.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['TP. Hồ Chí Minh']) },
      verified: true,
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'HR Bright Media',
      email: 'hr2@gmail.com',
      password: '123456',
      phone: '0900000002',
      address: 'Cầu Giấy, Hà Nội',
      companyName: 'Bright Media',
      companySize: '11-50',
      industry: 'Marketing',
      website: 'https://brightmedia.example.com',
      description: 'Agency digital marketing và content cho SME.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Hà Nội']) },
      verified: true,
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'HR Bean Cafe',
      email: 'hr3@gmail.com',
      password: '123456',
      phone: '0900000003',
      address: 'Hải Châu, Đà Nẵng',
      companyName: 'Bean Cafe',
      companySize: '11-50',
      industry: 'F&B',
      website: 'https://beancafe.example.com',
      description: 'Chuỗi cửa hàng đồ uống tuyển part-time và hỗ trợ vận hành sinh viên.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Đà Nẵng']) },
      verified: true,
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'HR Office Pro',
      email: 'hr4@gmail.com',
      password: '123456',
      phone: '0900000004',
      address: 'Lê Chân, Hải Phòng',
      companyName: 'Office Pro',
      companySize: '51-200',
      industry: 'Dịch vụ doanh nghiệp',
      website: 'https://officepro.example.com',
      description: 'Doanh nghiệp dịch vụ văn phòng, vận hành và hỗ trợ báo cáo.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Hải Phòng']) },
      verified: true,
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'HR Mekong Store',
      email: 'hr5@gmail.com',
      password: '123456',
      phone: '0900000005',
      address: 'Ninh Kiều, Cần Thơ',
      companyName: 'Mekong Store',
      companySize: '11-50',
      industry: 'Bán lẻ',
      website: 'https://mekongstore.example.com',
      description: 'Đơn vị bán lẻ và vận hành cửa hàng tuyển sinh viên part-time, intern.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Cần Thơ']) },
      verified: true,
      isActive: true,
      emailVerified: true,
    },
  ];

  for (const item of demoEmployers) {
    const exists = await Employer.findOne({ email: item.email.toLowerCase() }).select('_id');
    if (!exists) {
      await Employer.create(item);
    }
  }

  let employers = await Employer.find({
    email: { $in: DEMO_EMPLOYER_EMAILS.map((x) => x.toLowerCase()) },
  }).select('_id companyName email location');

  if (!employers.length) {
    employers = await Employer.find({ isActive: { $ne: false } })
      .select('_id companyName email location')
      .limit(5);
  }

  if (!employers.length) {
    throw new Error('Không có employer nào để seed job.');
  }

  return employers;
}

function generateOneJob({ employers, template, index }) {
  const employer = employers[index % employers.length];
  const city = template.targetCities[index % template.targetCities.length];
  const jobType = template.jobTypes[index % template.jobTypes.length];
  const level = template.levels[index % template.levels.length];
  const experience = template.experiences[index % template.experiences.length];
  const title = `${template.titles[index % template.titles.length]} #${index + 1}`;
  const createdAt = addDays(new Date(), -(index % 14));
  const workMode = buildWorkMode(jobType, template.workModes);
  const skillSet = splitSkillsForJob(template.skills);
  const acceptableMajors = buildAcceptableMajors(template);

  return {
    employer: employer._id,
    title,
    description: template.description,
    requirements: template.requirements,
    benefits: template.benefits,
    acceptableMajors,
    workMode,
    location: {
      address: buildAddress(city),
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
    categories: [...new Set([...template.categories, 'seed-demo'])],
    deadline: addDays(new Date(), 20 + (index % 20)),
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
  const jobs = [];

  for (let i = 0; i < count; i += 1) {
    const template = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    jobs.push(generateOneJob({ employers, template, index: i }));
  }

  return jobs;
}

async function seedJobs({ count = 40, reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const employers = await ensureDemoEmployers();

  if (reset) {
    const rs = await Job.deleteMany({
      categories: 'seed-demo',
    });
    console.log(`🧹 Đã xoá ${rs.deletedCount} seed jobs cũ`);
  }

  const jobs = buildBalancedJobs(employers, count);
  const result = await Job.insertMany(jobs, { ordered: false });

  console.log(`🎉 Seed job xong | created: ${result.length}`);
  console.log(`🏢 Employers dùng để seed: ${employers.length}`);
  console.log('📌 Toàn bộ job seed đều: active + verified + còn hạn + applicationsCount = 0');

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