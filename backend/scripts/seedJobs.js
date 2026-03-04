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
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận Bình Thạnh', 'Quận 7', 'TP. Thủ Đức', 'Quận Phú Nhuận'],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'],
  'Hải Phòng': ['Lê Chân', 'Ngô Quyền', 'Hồng Bàng', 'Kiến An'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn'],
};

const ALL_CITIES = Object.keys(CITY_COORDS);

const JOB_TEMPLATES = [
  {
    code: 'frontend',
    titles: [
      'Thực tập Frontend Developer',
      'Part-time Frontend Developer',
      'Frontend Intern (Vue/React)',
      'Web Frontend Intern',
    ],
    skills: ['javascript', 'html', 'css', 'vue', 'react', 'git'],
    categories: ['IT', 'Frontend', 'Web'],
    description:
      'Tham gia phát triển giao diện web, phối hợp cùng backend và designer để hoàn thiện tính năng cho sản phẩm.',
    requirements:
      'Có kiến thức HTML/CSS/JavaScript, biết Vue hoặc React, tư duy UI tốt và tinh thần học hỏi.',
    benefits:
      'Mentor 1-1, review code định kỳ, có cơ hội lên chính thức sau kỳ thực tập.',
    jobTypes: ['internship', 'part-time', 'full-time', 'contract', 'freelance'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [3000000, 12000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'],
  },
  {
    code: 'node-backend',
    titles: [
      'Backend Developer Intern',
      'Part-time Node.js Developer',
      'Junior Backend Developer',
      'Node.js API Intern',
    ],
    skills: ['nodejs', 'express', 'mongodb', 'api', 'javascript', 'git'],
    categories: ['IT', 'Backend', 'API'],
    description:
      'Phát triển API, làm việc với database, hỗ trợ xây dựng backend cho ứng dụng web/mobile.',
    requirements:
      'Biết Node.js/Express cơ bản, hiểu REST API, có kiến thức database là lợi thế.',
    benefits:
      'Review code định kỳ, môi trường thực chiến, học kiến trúc backend và deploy cơ bản.',
    jobTypes: ['internship', 'part-time', 'full-time', 'contract'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [3500000, 14000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'],
  },
  {
    code: 'java-backend',
    titles: [
      'Java Backend Intern',
      'Java Spring Intern',
      'Junior Java Developer',
      'Backend Java/Spring Fresher',
    ],
    skills: ['java', 'spring', 'spring boot', 'sql', 'api', 'git', 'docker'],
    categories: ['IT', 'Backend', 'API'],
    description:
      'Xây dựng API bằng Java/Spring, làm việc với SQL và tham gia các module backend thực tế.',
    requirements:
      'Nắm Java core, OOP, SQL; biết Spring hoặc Spring Boot là lợi thế lớn.',
    benefits:
      'Được hướng dẫn code chuẩn backend, tham gia dự án thật, có cơ hội lên fresher.',
    jobTypes: ['internship', 'full-time', 'part-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [5000000, 16000000],
    targetCities: ['TP. Hồ Chí Minh', 'Hà Nội'],
  },
  {
    code: 'dotnet',
    titles: [
      '.NET Developer Intern',
      'C# Developer Intern',
      'Junior .NET Developer',
      'Software Engineer Intern (.NET)',
    ],
    skills: ['c#', '.net', 'asp.net', 'sql', 'winforms', 'api', 'git'],
    categories: ['IT', 'Backend', 'Software'],
    description:
      'Phát triển ứng dụng .NET/C#, bảo trì module phần mềm nội bộ và hỗ trợ xử lý dữ liệu.',
    requirements:
      'Biết C#, OOP, SQL; hiểu .NET hoặc WinForms/ASP.NET là lợi thế.',
    benefits:
      'Môi trường thực chiến, có mentor review code, lộ trình phát triển rõ ràng.',
    jobTypes: ['internship', 'full-time', 'part-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [4500000, 15000000],
    targetCities: ['Cần Thơ', 'TP. Hồ Chí Minh', 'Hà Nội'],
  },
  {
    code: 'qa',
    titles: [
      'QA Tester Intern',
      'Part-time Manual Tester',
      'Junior QA/QC Tester',
      'Tester Fresher',
    ],
    skills: ['testing', 'testcase', 'bug-report', 'jira', 'excel'],
    categories: ['IT', 'QA', 'Testing'],
    description:
      'Kiểm thử chức năng web/app, viết test case, ghi nhận lỗi và phối hợp với dev để xử lý.',
    requirements:
      'Cẩn thận, tư duy logic tốt, biết viết test case là lợi thế.',
    benefits:
      'Training quy trình QA, tham gia dự án thật, lộ trình lên QA chính thức.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [2500000, 9000000],
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
  },
  {
    code: 'data-bi',
    titles: [
      'Data Analyst Intern',
      'BI Analyst Intern',
      'Power BI Intern',
      'Data Reporting Intern',
    ],
    skills: ['python', 'sql', 'excel', 'power bi', 'pandas', 'dashboard'],
    categories: ['Data', 'Data Analyst', 'BI'],
    description:
      'Hỗ trợ làm sạch dữ liệu, phân tích số liệu, xây dashboard và tạo báo cáo trực quan.',
    requirements:
      'Biết Excel tốt, có nền tảng SQL; biết Power BI hoặc Python là điểm cộng lớn.',
    benefits:
      'Được hướng dẫn xây dashboard thực tế, làm báo cáo dữ liệu cho team kinh doanh.',
    jobTypes: ['internship', 'part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [4000000, 14000000],
    targetCities: ['Hà Nội', 'Hải Phòng', 'TP. Hồ Chí Minh'],
  },
  {
    code: 'marketing',
    titles: [
      'Marketing Intern',
      'Part-time Digital Marketing',
      'Content Marketing CTV',
      'Social Media Intern',
    ],
    skills: ['marketing', 'content', 'seo', 'facebook ads', 'tiktok', 'canva'],
    categories: ['Marketing', 'Content', 'Digital'],
    description:
      'Hỗ trợ triển khai nội dung social media, tối ưu bài viết, hỗ trợ chiến dịch digital marketing.',
    requirements:
      'Yêu thích viết lách, sáng tạo nội dung, biết Canva là lợi thế.',
    benefits:
      'Làm việc linh hoạt, học thực chiến content/SEO, hỗ trợ dấu mộc thực tập.',
    jobTypes: ['internship', 'part-time', 'full-time', 'contract', 'freelance'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [2500000, 10000000],
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng'],
  },
  {
    code: 'design',
    titles: [
      'Design Intern',
      'Part-time Graphic Designer',
      'UI/UX Intern',
      'Graphic Design Fresher',
    ],
    skills: ['design', 'figma', 'photoshop', 'illustrator', 'canva', 'uiux'],
    categories: ['Design', 'UI/UX', 'Creative'],
    description:
      'Thiết kế banner/poster/social post, hỗ trợ UI màn hình web/app theo guideline.',
    requirements:
      'Biết Figma/Photoshop/Illustrator cơ bản. Có portfolio là điểm cộng.',
    benefits:
      'Được review thiết kế, tham gia dự án thật, làm việc cùng team sản phẩm.',
    jobTypes: ['internship', 'part-time', 'full-time', 'contract', 'freelance'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 11000000],
    targetCities: ['Đà Nẵng', 'Hà Nội', 'TP. Hồ Chí Minh'],
  },
  {
    code: 'business-ops',
    titles: [
      'Business Operations Intern',
      'Business Development Intern',
      'Operations Intern',
      'Sales Admin Intern',
    ],
    skills: ['excel', 'communication', 'presentation', 'teamwork', 'sales', 'reporting'],
    categories: ['Business', 'Sales', 'Operations'],
    description:
      'Hỗ trợ vận hành kinh doanh, tổng hợp báo cáo, làm việc với các bộ phận để theo dõi tiến độ.',
    requirements:
      'Giao tiếp tốt, tư duy sắp xếp công việc, sử dụng Excel/PowerPoint khá.',
    benefits:
      'Học cách vận hành doanh nghiệp, có cơ hội phát triển lên business analyst/sales ops.',
    jobTypes: ['internship', 'part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [3000000, 10000000],
    targetCities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng'],
  },
  {
    code: 'accounting',
    titles: [
      'Thực tập Kế toán',
      'Part-time Nhập liệu kế toán',
      'Cộng tác viên kế toán',
      'Accounting Admin Intern',
    ],
    skills: ['excel', 'accounting', 'data entry', 'word'],
    categories: ['Kế toán', 'Tài chính', 'Văn phòng'],
    description:
      'Hỗ trợ nhập liệu chứng từ, tổng hợp số liệu và làm báo cáo đơn giản bằng Excel.',
    requirements:
      'Cẩn thận, trung thực, dùng Excel tốt. Học ngành kế toán/tài chính là lợi thế.',
    benefits:
      'Môi trường văn phòng ổn định, phù hợp sinh viên năm 2-4.',
    jobTypes: ['part-time', 'internship', 'contract'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [2500000, 8000000],
    targetCities: ['Hà Nội', 'Hải Phòng', 'Cần Thơ'],
  },
  {
    code: 'cskh-sales',
    titles: [
      'Nhân viên CSKH Part-time',
      'Tư vấn viên bán thời gian',
      'Part-time Chat Support',
      'Sales Support Intern',
    ],
    skills: ['communication', 'customer service', 'sales', 'excel'],
    categories: ['CSKH', 'Sales', 'Văn phòng'],
    description:
      'Hỗ trợ khách hàng qua chat/điện thoại, tư vấn sản phẩm và nhập thông tin đơn hàng.',
    requirements:
      'Giao tiếp tốt, có trách nhiệm. Không yêu cầu kinh nghiệm.',
    benefits:
      'Ca linh hoạt, phù hợp sinh viên, có thưởng theo hiệu suất.',
    jobTypes: ['part-time', 'full-time', 'contract'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 9000000],
    targetCities: ['TP. Hồ Chí Minh', 'Cần Thơ', 'Hà Nội'],
  },
  {
    code: 'fnb',
    titles: [
      'Nhân viên phục vụ Part-time',
      'Barista Part-time',
      'Thu ngân ca tối',
      'Phục vụ ca cuối tuần',
    ],
    skills: ['customer service', 'communication', 'teamwork'],
    categories: ['F&B', 'Dịch vụ', 'Part-time'],
    description:
      'Phục vụ khách hàng, hỗ trợ quầy, giữ vệ sinh khu vực làm việc và phối hợp theo ca.',
    requirements:
      'Nhanh nhẹn, đúng giờ, có thể làm ca tối/cuối tuần.',
    benefits:
      'Phù hợp sinh viên, sắp ca linh hoạt, hỗ trợ đào tạo ban đầu.',
    jobTypes: ['part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [2500000, 7000000],
    targetCities: ['Đà Nẵng', 'TP. Hồ Chí Minh', 'Cần Thơ'],
  },
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBool(prob = 0.5) {
  return Math.random() < prob;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function jitterCoordinates([lng, lat]) {
  const lngOffset = (Math.random() - 0.5) * 0.08;
  const latOffset = (Math.random() - 0.5) * 0.08;
  return [Number((lng + lngOffset).toFixed(6)), Number((lat + latOffset).toFixed(6))];
}

function buildAddress(city) {
  const streets = [
    'Nguyễn Huệ',
    'Lê Lợi',
    'Hai Bà Trưng',
    'Điện Biên Phủ',
    'Cách Mạng Tháng 8',
    'Trần Hưng Đạo',
  ];
  const districts = DISTRICTS_BY_CITY[city] || ['Trung tâm'];
  return `${randomInt(10, 999)} ${randomItem(streets)}, ${randomItem(districts)}, ${city}`;
}

function buildSalary([minBase, maxBase], jobType) {
  let min = randomInt(minBase, Math.floor((minBase + maxBase) / 2));
  let max = randomInt(min + 500000, maxBase);

  if (jobType === 'full-time') {
    min += 1000000;
    max += 2000000;
  }

  if (jobType === 'contract') {
    min += 500000;
    max += 1500000;
  }

  return {
    min,
    max,
    currency: 'VND',
    negotiable: jobType === 'freelance' ? randomBool(0.55) : randomBool(0.18),
  };
}

function buildAcceptableMajors(tpl) {
  const cats = (tpl.categories || []).map((c) => String(c).toLowerCase());

  if (
    cats.includes('it') ||
    cats.includes('backend') ||
    cats.includes('frontend') ||
    cats.includes('web') ||
    cats.includes('api') ||
    cats.includes('software')
  ) {
    return [
      'Công nghệ thông tin',
      'Khoa học máy tính',
      'Hệ thống thông tin',
      'Kỹ thuật phần mềm',
      'An toàn thông tin',
    ];
  }

  if (cats.includes('data') || cats.includes('bi') || cats.includes('data analyst')) {
    return [
      'Khoa học dữ liệu',
      'Công nghệ thông tin',
      'Hệ thống thông tin',
      'Toán tin',
      'Thống kê',
    ];
  }

  if (cats.includes('marketing') || cats.includes('content') || cats.includes('digital')) {
    return ['Marketing', 'Quản trị kinh doanh', 'Truyền thông', 'Thương mại điện tử'];
  }

  if (cats.includes('design') || cats.includes('ui/ux') || cats.includes('creative')) {
    return [
      'Thiết kế đồ họa',
      'Thiết kế',
      'Mỹ thuật ứng dụng',
      'Truyền thông đa phương tiện',
    ];
  }

  if (cats.includes('business') || cats.includes('sales') || cats.includes('operations')) {
    return ['Quản trị kinh doanh', 'Kinh tế', 'Thương mại', 'Marketing'];
  }

  if (cats.includes('kế toán') || cats.includes('tài chính')) {
    return ['Kế toán', 'Tài chính', 'Kiểm toán', 'Ngân hàng'];
  }

  return [];
}

function buildWorkMode(jobType) {
  const r = Math.random();

  if (jobType === 'internship' || jobType === 'part-time') {
    if (r < 0.30) return 'remote';
    if (r < 0.72) return 'hybrid';
    return 'onsite';
  }

  if (r < 0.12) return 'remote';
  if (r < 0.42) return 'hybrid';
  return 'onsite';
}

function splitSkillsForJob(skills) {
  const s = Array.isArray(skills) ? skills : [];

  if (s.length <= 3) {
    return { requiredSkills: [...s], preferredSkills: [] };
  }

  const requiredCount = Math.max(3, Math.min(4, s.length - 1));
  const requiredSkills = s.slice(0, requiredCount);
  const preferredSkills = s.slice(requiredCount);

  return { requiredSkills, preferredSkills };
}

function pickCityForTemplate(tpl) {
  const cities = Array.isArray(tpl.targetCities) && tpl.targetCities.length
    ? tpl.targetCities
    : ALL_CITIES;
  return randomItem(cities);
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
      industry: 'Công nghệ',
      website: 'https://techone.example.com',
      description: 'Công ty công nghệ tuyển thực tập sinh và fresher IT.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['TP. Hồ Chí Minh']) },
      verified: true,
      isActive: true,
    },
    {
      fullName: 'HR Bright Media',
      email: 'hr2@gmail.com',
      password: '123456',
      phone: '0900000002',
      address: 'Cầu Giấy, Hà Nội',
      companyName: 'Bright Media',
      industry: 'Marketing',
      website: 'https://brightmedia.example.com',
      description: 'Agency digital marketing và content.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Hà Nội']) },
      verified: true,
      isActive: true,
    },
    {
      fullName: 'HR Bean Cafe',
      email: 'hr3@gmail.com',
      password: '123456',
      phone: '0900000003',
      address: 'Hải Châu, Đà Nẵng',
      companyName: 'Bean Cafe',
      industry: 'F&B',
      website: 'https://beancafe.example.com',
      description: 'Chuỗi quán cà phê tuyển part-time sinh viên.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Đà Nẵng']) },
      verified: true,
      isActive: true,
    },
    {
      fullName: 'HR Office Pro',
      email: 'hr4@gmail.com',
      password: '123456',
      phone: '0900000004',
      address: 'Lê Chân, Hải Phòng',
      companyName: 'Office Pro',
      industry: 'Dịch vụ văn phòng',
      website: 'https://officepro.example.com',
      description: 'Cung cấp dịch vụ vận hành và tuyển dụng nhân sự văn phòng.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Hải Phòng']) },
      verified: true,
      isActive: true,
    },
    {
      fullName: 'HR Mekong Store',
      email: 'hr5@gmail.com',
      password: '123456',
      phone: '0900000005',
      address: 'Ninh Kiều, Cần Thơ',
      companyName: 'Mekong Store',
      industry: 'Bán lẻ',
      website: 'https://mekongstore.example.com',
      description: 'Cửa hàng bán lẻ tuyển nhân viên CSKH và nhập liệu part-time.',
      location: { type: 'Point', coordinates: jitterCoordinates(CITY_COORDS['Cần Thơ']) },
      verified: true,
      isActive: true,
    },
  ];

  for (const e of demoEmployers) {
    try {
      const exists = await Employer.findOne({ email: e.email.toLowerCase() });
      if (!exists) {
        await Employer.create(e);
      }
    } catch (err) {
      console.warn(`⚠️ Không tạo được employer ${e.email}: ${err.message}`);
    }
  }

  let employers = await Employer.find({
    email: { $in: DEMO_EMPLOYER_EMAILS.map((x) => x.toLowerCase()) },
  }).select('_id companyName email location');

  if (!employers.length) {
    employers = await Employer.find({ isActive: { $ne: false } })
      .select('_id companyName email location')
      .limit(10);

    if (employers.length) {
      console.log(`ℹ️ Không lấy được employer demo, dùng ${employers.length} employer có sẵn.`);
    }
  }

  return employers;
}

function generateOneJob(employers, tpl, index) {
  const employer = randomItem(employers);
  const city = pickCityForTemplate(tpl);
  const jobType = randomItem(tpl.jobTypes);
  const level = randomItem(tpl.levels);
  const experience = randomItem(tpl.experiences);

  let status = 'active';
  const statusRoll = Math.random();
  if (statusRoll > 0.92) status = 'closed';

  const makeExpiredByDeadline = status === 'active' && Math.random() < 0.08;
  const deadline = makeExpiredByDeadline
    ? addDays(new Date(), -randomInt(1, 10))
    : addDays(new Date(), randomInt(10, 45));

  const title = `${randomItem(tpl.titles)} #${index + 1}`;

  const shuffledSkills = [...tpl.skills].sort(() => Math.random() - 0.5);
  const pickedSkills =
    shuffledSkills.length <= 4
      ? shuffledSkills
      : shuffledSkills.slice(0, randomInt(4, Math.min(6, shuffledSkills.length)));

  const { requiredSkills, preferredSkills } = splitSkillsForJob(pickedSkills);
  const acceptableMajors = buildAcceptableMajors(tpl);
  const workMode = buildWorkMode(jobType);

  return {
    employer: employer._id,
    title,
    description: tpl.description,
    requirements: tpl.requirements,
    benefits: tpl.benefits,
    location: {
      address: buildAddress(city),
      city,
      coordinates: jitterCoordinates(CITY_COORDS[city]),
    },
    salary: buildSalary(tpl.salaryRange, jobType),
    jobType,
    level,
    experience,
    skills: pickedSkills,
    requiredSkills,
    preferredSkills,
    acceptableMajors,
    workMode,
    categories: [...new Set([...tpl.categories, 'seed-demo'])],
    deadline,
    slots: randomInt(1, 5),
    status,
    isVerified: true,
    views: randomInt(10, 180),
    applicationsCount: randomInt(0, 20),
    createdAt: addDays(new Date(), -randomInt(0, 14)),
    updatedAt: new Date(),
  };
}

function buildBalancedJobs(employers, count) {
  const jobs = [];

  for (let i = 0; i < count; i += 1) {
    const tpl = JOB_TEMPLATES[i % JOB_TEMPLATES.length];
    jobs.push(generateOneJob(employers, tpl, i));
  }

  return jobs;
}

async function seedJobs({ count = 90, reset = false }) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  if (reset) {
    const rs = await Job.deleteMany({ categories: 'seed-demo' });
    console.log(`🧹 Đã xoá ${rs.deletedCount} job seed cũ`);
  }

  const employers = await ensureDemoEmployers();
  if (!employers.length) {
    throw new Error(
      'Không thể tạo/lấy employer demo. Hãy kiểm tra schema Employer hoặc tạo sẵn 1 employer.'
    );
  }

  const jobs = buildBalancedJobs(employers, count);
  const inserted = await Job.insertMany(jobs);

  console.log(`🎉 Seed thành công ${inserted.length} jobs`);
  console.log('📌 Dùng categories = "seed-demo" để lọc/xoá lại sau này');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const args = process.argv.slice(2);
const countArg = args.find((a) => a.startsWith('--count='));
const count = countArg ? Number(countArg.split('=')[1]) : 90;
const reset = args.includes('--reset');

seedJobs({ count, reset }).catch(async (err) => {
  console.error('❌ Lỗi seed jobs:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});