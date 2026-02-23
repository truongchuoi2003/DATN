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
  'Hà Nội': ['Cầu Giấy', 'Đống Đa', 'Hai Bà Trưng', 'Ba Đình', 'Thanh Xuân'],
  'TP. Hồ Chí Minh': ['Quận 1', 'Quận 3', 'Quận Bình Thạnh', 'Quận 7', 'TP. Thủ Đức'],
  'Đà Nẵng': ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn'],
  'Hải Phòng': ['Lê Chân', 'Ngô Quyền', 'Hồng Bàng', 'Kiến An'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn'],
};

const JOB_TEMPLATES = [
  {
    titles: ['Thực tập Frontend Developer', 'Part-time Frontend Developer', 'Frontend Intern (Vue/React)'],
    skills: ['javascript', 'html', 'css', 'vue', 'react', 'git'],
    categories: ['IT', 'Frontend', 'Web'],
    description: 'Tham gia phát triển giao diện web, phối hợp cùng backend và designer để hoàn thiện tính năng cho sản phẩm.',
    requirements: 'Có kiến thức HTML/CSS/JavaScript, biết Vue hoặc React, tinh thần học hỏi tốt.',
    benefits: 'Hỗ trợ training, mentor 1-1, thời gian linh hoạt, có cơ hội lên chính thức.',
    jobTypes: ['internship', 'part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [3000000, 12000000],
  },
  {
    titles: ['Backend Developer Intern', 'Part-time Node.js Developer', 'Junior Backend Developer'],
    skills: ['nodejs', 'express', 'mongodb', 'api', 'javascript', 'git'],
    categories: ['IT', 'Backend', 'API'],
    description: 'Phát triển API, làm việc với MongoDB, hỗ trợ xây dựng hệ thống backend cho ứng dụng web/mobile.',
    requirements: 'Biết Node.js/Express cơ bản, hiểu REST API, có kiến thức database là lợi thế.',
    benefits: 'Review code định kỳ, môi trường thực chiến, cơ hội học kiến trúc hệ thống.',
    jobTypes: ['internship', 'part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [3500000, 14000000],
  },
  {
    titles: ['QA Tester Intern', 'Part-time Manual Tester', 'Junior QA/QC Tester'],
    skills: ['testing', 'testcase', 'bug-report', 'jira', 'excel'],
    categories: ['IT', 'QA', 'Testing'],
    description: 'Kiểm thử chức năng web/app, viết test case, ghi nhận lỗi và phối hợp với dev để xử lý.',
    requirements: 'Cẩn thận, tư duy logic tốt, biết viết test case là lợi thế.',
    benefits: 'Training quy trình QA, tham gia dự án thật, lộ trình lên QA chính thức.',
    jobTypes: ['internship', 'part-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [2500000, 9000000],
  },
  {
    titles: ['Marketing Intern', 'Part-time Digital Marketing', 'Content Marketing CTV'],
    skills: ['marketing', 'content', 'seo', 'facebook ads', 'tiktok', 'canva'],
    categories: ['Marketing', 'Content', 'Digital'],
    description: 'Hỗ trợ triển khai nội dung social media, tối ưu bài viết, hỗ trợ chiến dịch digital marketing.',
    requirements: 'Yêu thích viết lách, sáng tạo nội dung, biết Canva là lợi thế.',
    benefits: 'Làm việc linh hoạt, học thực chiến content/SEO, hỗ trợ dấu mộc thực tập.',
    jobTypes: ['internship', 'part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year', '1-3-years'],
    salaryRange: [2500000, 10000000],
  },
  {
    titles: ['Design Intern', 'Part-time Graphic Designer', 'UI/UX Intern'],
    skills: ['design', 'figma', 'photoshop', 'illustrator', 'canva', 'uiux'],
    categories: ['Design', 'UI/UX', 'Creative'],
    description: 'Thiết kế banner/poster/social post, hỗ trợ UI màn hình web/app theo guideline.',
    requirements: 'Biết Figma/Photoshop/Illustrator cơ bản. Có portfolio là điểm cộng.',
    benefits: 'Được review thiết kế, tham gia dự án thật, làm việc cùng team sản phẩm.',
    jobTypes: ['internship', 'part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 11000000],
  },
  {
    titles: ['Thực tập Kế toán', 'Part-time Nhập liệu kế toán', 'Cộng tác viên kế toán'],
    skills: ['excel', 'accounting', 'data entry', 'word'],
    categories: ['Kế toán', 'Tài chính', 'Văn phòng'],
    description: 'Hỗ trợ nhập liệu chứng từ, tổng hợp số liệu và làm báo cáo đơn giản bằng Excel.',
    requirements: 'Cẩn thận, trung thực, dùng Excel tốt. Học ngành kế toán/tài chính là lợi thế.',
    benefits: 'Môi trường văn phòng ổn định, phù hợp sinh viên năm 2-4.',
    jobTypes: ['part-time', 'internship'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [2500000, 8000000],
  },
  {
    titles: ['Nhân viên CSKH Part-time', 'Tư vấn viên bán thời gian', 'Part-time Chat Support'],
    skills: ['communication', 'customer service', 'sales', 'excel'],
    categories: ['CSKH', 'Sales', 'Văn phòng'],
    description: 'Hỗ trợ khách hàng qua chat/điện thoại, tư vấn sản phẩm và nhập thông tin đơn hàng.',
    requirements: 'Giao tiếp tốt, có trách nhiệm. Không yêu cầu kinh nghiệm.',
    benefits: 'Ca linh hoạt, phù hợp sinh viên, có thưởng theo hiệu suất.',
    jobTypes: ['part-time', 'full-time'],
    levels: ['intern', 'fresher', 'junior'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [3000000, 9000000],
  },
  {
    titles: ['Nhân viên phục vụ Part-time', 'Barista Part-time', 'Thu ngân ca tối'],
    skills: ['customer service', 'communication', 'teamwork'],
    categories: ['F&B', 'Dịch vụ', 'Part-time'],
    description: 'Phục vụ khách hàng, hỗ trợ quầy, giữ vệ sinh khu vực làm việc và phối hợp theo ca.',
    requirements: 'Nhanh nhẹn, đúng giờ, có thể làm ca tối/cuối tuần.',
    benefits: 'Phù hợp sinh viên, sắp ca linh hoạt, hỗ trợ đào tạo ban đầu.',
    jobTypes: ['part-time'],
    levels: ['intern', 'fresher'],
    experiences: ['no-experience', '0-1-year'],
    salaryRange: [2500000, 7000000],
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
  const streets = ['Nguyễn Huệ', 'Lê Lợi', 'Hai Bà Trưng', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Trần Hưng Đạo'];
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

  return {
    min,
    max,
    currency: 'VND',
    negotiable: randomBool(0.2),
  };
}

async function ensureDemoEmployers() {
  const demoEmployers = [
    {
      fullName: 'HR Tech One',
      email: 'hr1@gmail.com',
      password: '123456',
      phone: '0900000001',
      address: 'Quận 1, TP. Hồ Chí Minh',
      companyName: 'Tech One',
      industry: 'Công nghệ',
      website: 'https://techone.example.com',
      description: 'Công ty phát triển phần mềm web/mobile.',
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
        await Employer.create(e); // create() để chạy pre-save hash password
      }
    } catch (err) {
      console.warn(`⚠️ Không tạo được employer ${e.email}: ${err.message}`);
    }
  }

  let employers = await Employer.find({
    email: { $in: DEMO_EMPLOYER_EMAILS.map((x) => x.toLowerCase()) },
  }).select('_id companyName email location');

  // Fallback: dùng employer có sẵn trong DB nếu demo fail
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

function generateOneJob(employers, index) {
  const tpl = randomItem(JOB_TEMPLATES);
  const employer = randomItem(employers);

  const city = randomItem(Object.keys(CITY_COORDS));
  const jobType = randomItem(tpl.jobTypes);
  const level = randomItem(tpl.levels);
  const experience = randomItem(tpl.experiences);

  // Chỉ dùng status an toàn: active / closed
  // "Hết hạn" sẽ mô phỏng bằng deadline < now
  let status = 'active';
  const r = Math.random();
  if (r > 0.9) status = 'closed';

  const makeExpiredByDeadline = status === 'active' && Math.random() < 0.12;
  const deadline = makeExpiredByDeadline
    ? addDays(new Date(), -randomInt(1, 20))
    : addDays(new Date(), randomInt(7, 45));

  const title = `${randomItem(tpl.titles)} #${index + 1}`;
  const skills = [...tpl.skills]
    .sort(() => Math.random() - 0.5)
    .slice(0, randomInt(3, Math.min(6, tpl.skills.length)));

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
    skills,
    categories: [...new Set([...tpl.categories, 'seed-demo'])],
    deadline,
    slots: randomInt(1, 5),
    status,
    isVerified: true,
    views: randomInt(0, 300),
    applicationsCount: 0,
    createdAt: addDays(new Date(), -randomInt(0, 20)),
    updatedAt: new Date(),
  };
}

async function seedJobs({ count = 40, reset = false }) {
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
    throw new Error('Không thể tạo/lấy employer demo. Hãy kiểm tra schema Employer hoặc tạo sẵn 1 employer.');
  }

  const jobs = Array.from({ length: count }, (_, i) => generateOneJob(employers, i));
  const inserted = await Job.insertMany(jobs);

  console.log(`🎉 Seed thành công ${inserted.length} jobs`);
  console.log('📌 Dùng categories = "seed-demo" để lọc/xoá lại sau này');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const args = process.argv.slice(2);
const countArg = args.find((a) => a.startsWith('--count='));
const count = countArg ? Number(countArg.split('=')[1]) : 40;
const reset = args.includes('--reset');

seedJobs({ count, reset }).catch(async (err) => {
  console.error('❌ Lỗi seed jobs:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});