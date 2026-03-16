const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Interaction = require('../src/models/Interaction.model');

const CITY_COORDS = {
  'Hà Nội': [105.83416, 21.02776],
  'TP. Hồ Chí Minh': [106.70098, 10.77689],
  'Đà Nẵng': [108.20217, 16.05441],
  'Hải Phòng': [106.68808, 20.84491],
  'Cần Thơ': [105.78309, 10.04516],
};

const SEED_STUDENT_EMAILS = [
  'student1@gmail.com',
  'student2@gmail.com',
  'student3@gmail.com',
  'student4@gmail.com',
  'student5@gmail.com',
  'student6@gmail.com',
  'student7@gmail.com',
];

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    reset: args.includes('--reset'),
  };
}

function addJitter([lng, lat], range = 0.03) {
  const lngOffset = (Math.random() - 0.5) * range;
  const latOffset = (Math.random() - 0.5) * range;

  return [
    Number((lng + lngOffset).toFixed(6)),
    Number((lat + latOffset).toFixed(6)),
  ];
}

function buildStudentSeeds() {
  return [
    {
      fullName: 'Nguyễn Minh Khang',
      email: 'student1@gmail.com',
      password: '123456',
      phone: '0901000001',
      birthday: new Date('2004-03-12'),
      address: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
      studentId: 'SV001',
      major: 'Công nghệ thông tin',
      university: 'Đại học Công nghệ TP.HCM',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.32,
      skills: ['javascript', 'html', 'css', 'vue', 'git', 'responsive design'],
      preferredCategories: ['IT', 'Frontend', 'Web'],
      desiredJobTitles: [
        'Frontend Intern',
        'Thực tập Frontend Developer',
        'Web Frontend Intern',
      ],
      preferredLocations: ['TP. Hồ Chí Minh', 'Đà Nẵng'],
      preferredJobTypes: ['internship', 'part-time'],
      preferredWorkModes: ['hybrid', 'remote'],
      salaryExpectation: { min: 3000000, max: 8000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: [
        'Website tìm kiếm và gợi ý việc làm cho sinh viên',
        'Landing page giới thiệu câu lạc bộ',
      ],
      projectTechnologies: ['vue', 'nodejs', 'mongodb', 'express', 'javascript'],
      languages: [{ name: 'Tiếng Anh', level: 'Khá' }],
      certifications: ['TOEIC 650'],
      resumeUrl: '/uploads/cv/student1.pdf',
      portfolioUrl: 'https://portfolio.example.com/student1',
      githubUrl: 'https://github.com/student1',
      linkedinUrl: 'https://linkedin.com/in/student1',
      bio: 'Sinh viên frontend, muốn tìm internship hoặc part-time để phát triển kỹ năng Vue và JavaScript.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['TP. Hồ Chí Minh']),
      },
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'Trần Thu Trang',
      email: 'student2@gmail.com',
      password: '123456',
      phone: '0901000002',
      birthday: new Date('2003-08-21'),
      address: 'Quận Cầu Giấy, Hà Nội',
      studentId: 'SV002',
      major: 'Marketing',
      university: 'Đại học Thương mại',
      academicYear: '4',
      graduationYear: 2026,
      gpa: 3.55,
      skills: ['marketing', 'content', 'seo', 'canva', 'facebook ads', 'tiktok'],
      preferredCategories: ['Marketing', 'Content', 'Digital'],
      desiredJobTitles: [
        'Content Marketing Intern',
        'Social Media Intern',
        'Marketing Intern',
      ],
      preferredLocations: ['Hà Nội', 'TP. Hồ Chí Minh'],
      preferredJobTypes: ['internship', 'part-time', 'freelance'],
      preferredWorkModes: ['onsite', 'hybrid'],
      salaryExpectation: { min: 2500000, max: 7000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: [
        'Kế hoạch nội dung TikTok cho câu lạc bộ sinh viên',
        'SEO audit website ẩm thực địa phương',
      ],
      projectTechnologies: ['seo', 'content', 'facebook ads', 'canva'],
      languages: [{ name: 'Tiếng Anh', level: 'Khá' }],
      certifications: ['Google Analytics Basic'],
      resumeUrl: '/uploads/cv/student2.pdf',
      portfolioUrl: 'https://portfolio.example.com/student2',
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/student2',
      bio: 'Yêu thích content marketing, social media và các công việc thiên về nội dung số.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hà Nội']),
      },
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'Lê Hoàng Nam',
      email: 'student3@gmail.com',
      password: '123456',
      phone: '0901000003',
      birthday: new Date('2004-01-05'),
      address: 'Quận Hải Châu, Đà Nẵng',
      studentId: 'SV003',
      major: 'Thiết kế đồ họa',
      university: 'Đại học Kiến trúc Đà Nẵng',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.18,
      skills: ['design', 'figma', 'photoshop', 'canva', 'ui', 'ux'],
      preferredCategories: ['Design', 'UI/UX', 'Creative'],
      desiredJobTitles: [
        'UI/UX Intern',
        'Graphic Designer Intern',
        'Design Intern',
      ],
      preferredLocations: ['Đà Nẵng', 'TP. Hồ Chí Minh'],
      preferredJobTypes: ['internship', 'part-time', 'freelance'],
      preferredWorkModes: ['remote', 'hybrid'],
      salaryExpectation: { min: 2500000, max: 8000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: [
        'Thiết kế giao diện ứng dụng quản lý công việc',
        'Bộ nhận diện thương hiệu mini cho quán cà phê',
      ],
      projectTechnologies: ['figma', 'photoshop', 'canva'],
      languages: [{ name: 'Tiếng Anh', level: 'Cơ bản' }],
      certifications: ['Adobe Photoshop Basic'],
      resumeUrl: '/uploads/cv/student3.pdf',
      portfolioUrl: 'https://portfolio.example.com/student3',
      githubUrl: '',
      linkedinUrl: '',
      bio: 'Muốn phát triển theo hướng thiết kế giao diện và thiết kế social post.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Đà Nẵng']),
      },
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'Phạm Ngọc Hân',
      email: 'student4@gmail.com',
      password: '123456',
      phone: '0901000004',
      birthday: new Date('2003-11-02'),
      address: 'Quận 7, TP. Hồ Chí Minh',
      studentId: 'SV004',
      major: 'Công nghệ thông tin',
      university: 'Đại học Bách khoa TP.HCM',
      academicYear: '4',
      graduationYear: 2026,
      gpa: 3.61,
      skills: ['java', 'spring', 'spring boot', 'sql', 'git', 'docker'],
      preferredCategories: ['IT', 'Backend', 'API'],
      desiredJobTitles: [
        'Java Backend Intern',
        'Java Spring Intern',
        'Junior Java Developer',
      ],
      preferredLocations: ['TP. Hồ Chí Minh', 'Hà Nội'],
      preferredJobTypes: ['internship', 'full-time'],
      preferredWorkModes: ['onsite', 'hybrid'],
      salaryExpectation: { min: 6000000, max: 15000000, currency: 'VND' },
      experienceLevel: 'fresher',
      experienceMonths: 4,
      projects: [
        'API quản lý bán hàng bằng Spring Boot',
        'Hệ thống đặt phòng học nhóm',
      ],
      projectTechnologies: ['java', 'spring', 'spring boot', 'mysql', 'docker'],
      languages: [{ name: 'Tiếng Anh', level: 'Khá' }],
      certifications: ['Java Core Certificate'],
      resumeUrl: '/uploads/cv/student4.pdf',
      portfolioUrl: '',
      githubUrl: 'https://github.com/student4',
      linkedinUrl: 'https://linkedin.com/in/student4',
      bio: 'Định hướng backend Java/Spring và muốn tìm vị trí fresher hoặc intern có mentor.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['TP. Hồ Chí Minh']),
      },
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'Võ Gia Bảo',
      email: 'student5@gmail.com',
      password: '123456',
      phone: '0901000005',
      birthday: new Date('2004-06-18'),
      address: 'Quận Ngô Quyền, Hải Phòng',
      studentId: 'SV005',
      major: 'Khoa học dữ liệu',
      university: 'Đại học Hàng hải Việt Nam',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.46,
      skills: ['python', 'pandas', 'sql', 'excel', 'power bi', 'dashboard'],
      preferredCategories: ['Data', 'Data Analyst', 'BI'],
      desiredJobTitles: [
        'Data Analyst Intern',
        'BI Analyst Intern',
        'Power BI Intern',
      ],
      preferredLocations: ['Hải Phòng', 'Hà Nội', 'TP. Hồ Chí Minh'],
      preferredJobTypes: ['internship', 'part-time'],
      preferredWorkModes: ['remote', 'hybrid'],
      salaryExpectation: { min: 4000000, max: 10000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: [
        'Dashboard doanh thu bán lẻ bằng Power BI',
        'Phân tích dữ liệu khảo sát hành vi người dùng',
      ],
      projectTechnologies: ['python', 'pandas', 'sql', 'power bi'],
      languages: [{ name: 'Tiếng Anh', level: 'Khá' }],
      certifications: ['Microsoft Power BI Basic'],
      resumeUrl: '/uploads/cv/student5.pdf',
      portfolioUrl: 'https://portfolio.example.com/student5',
      githubUrl: 'https://github.com/student5',
      linkedinUrl: '',
      bio: 'Quan tâm đến phân tích dữ liệu, trực quan hóa số liệu và báo cáo kinh doanh.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hải Phòng']),
      },
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'Nguyễn Khánh Linh',
      email: 'student6@gmail.com',
      password: '123456',
      phone: '0901000006',
      birthday: new Date('2004-09-09'),
      address: 'Quận Ninh Kiều, Cần Thơ',
      studentId: 'SV006',
      major: 'Hệ thống thông tin',
      university: 'Đại học Cần Thơ',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.37,
      skills: ['c#', '.net', 'asp.net', 'sql', 'testing', 'testcase'],
      preferredCategories: ['IT', 'QA', 'Software'],
      desiredJobTitles: [
        'QA Tester Intern',
        '.NET Developer Intern',
        'Manual Tester Intern',
      ],
      preferredLocations: ['Cần Thơ', 'TP. Hồ Chí Minh'],
      preferredJobTypes: ['internship', 'full-time', 'part-time'],
      preferredWorkModes: ['onsite', 'hybrid'],
      salaryExpectation: { min: 4000000, max: 10000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: [
        'Hệ thống quản lý thư viện bằng C#',
        'Kiểm thử chức năng website đặt lịch',
      ],
      projectTechnologies: ['c#', '.net', 'sql', 'testing'],
      languages: [{ name: 'Tiếng Anh', level: 'Khá' }],
      certifications: ['ISTQB Foundation Mock Training'],
      resumeUrl: '/uploads/cv/student6.pdf',
      portfolioUrl: '',
      githubUrl: 'https://github.com/student6',
      linkedinUrl: '',
      bio: 'Quan tâm tới kiểm thử phần mềm và phát triển ứng dụng .NET ở mức intern/fresher.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Cần Thơ']),
      },
      isActive: true,
      emailVerified: true,
    },
    {
      fullName: 'Đỗ Nhật Anh',
      email: 'student7@gmail.com',
      password: '123456',
      phone: '0901000007',
      birthday: new Date('2004-02-17'),
      address: 'Quận Đống Đa, Hà Nội',
      studentId: 'SV007',
      major: 'Quản trị kinh doanh',
      university: 'Đại học Kinh tế Quốc dân',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.42,
      skills: ['excel', 'presentation', 'communication', 'teamwork', 'sales', 'reporting'],
      preferredCategories: ['Business', 'Sales', 'Operations'],
      desiredJobTitles: [
        'Business Operations Intern',
        'Business Development Intern',
        'Operations Intern',
        'Sales Admin Intern',
      ],
      preferredLocations: ['Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng'],
      preferredJobTypes: ['internship', 'part-time'],
      preferredWorkModes: ['onsite', 'hybrid'],
      salaryExpectation: { min: 2500000, max: 7000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: [
        'Kế hoạch kinh doanh TMĐT',
        'Nghiên cứu thị trường bán lẻ',
      ],
      projectTechnologies: ['excel', 'powerpoint', 'reporting'],
      languages: [{ name: 'Tiếng Anh', level: 'Khá' }],
      certifications: ['IELTS 5.5'],
      resumeUrl: '/uploads/cv/student7.pdf',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/student7',
      bio: 'Yêu thích vận hành, kinh doanh và các công việc hỗ trợ phát triển khách hàng.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hà Nội']),
      },
      isActive: true,
      emailVerified: true,
    },
  ];
}

async function seedStudents({ reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

if (reset) {
  const oldStudents = await Student.find({
    email: { $in: SEED_STUDENT_EMAILS.map((x) => x.toLowerCase()) },
  }).select('_id');

  const oldStudentIds = oldStudents.map((x) => x._id);

  if (oldStudentIds.length) {
    const [deletedApplications, deletedInteractions] = await Promise.all([
      Application.deleteMany({ student: { $in: oldStudentIds } }),
      Interaction.deleteMany({ student: { $in: oldStudentIds } }),
    ]);

    console.log(
      `🧹 Đã xoá dữ liệu liên quan student cũ | applications=${deletedApplications.deletedCount}, interactions=${deletedInteractions.deletedCount}`
    );
  }

  const rs = await Student.deleteMany({
    email: { $in: SEED_STUDENT_EMAILS.map((x) => x.toLowerCase()) },
  });

  console.log(`🧹 Đã xoá ${rs.deletedCount} student seed cũ`);
}

  const seeds = buildStudentSeeds();

  let created = 0;
  let skipped = 0;

  for (const seed of seeds) {
    const exists = await Student.findOne({ email: seed.email.toLowerCase() }).select('_id');
    if (exists) {
      skipped += 1;
      continue;
    }

    await Student.create(seed);
    created += 1;
  }

  console.log(`🎉 Seed student xong | created: ${created}, skipped: ${skipped}`);
  console.log('📌 Tài khoản test: student1@gmail.com ... student7@gmail.com | password: 123456');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { reset } = parseArgs();

seedStudents({ reset }).catch(async (err) => {
  console.error('❌ Lỗi seed students:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});