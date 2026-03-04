const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');

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

function addJitter([lng, lat], range = 0.05) {
  const lngOffset = (Math.random() - 0.5) * range;
  const latOffset = (Math.random() - 0.5) * range;
  return [Number((lng + lngOffset).toFixed(6)), Number((lat + latOffset).toFixed(6))];
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
      gpa: 3.2,
      skills: ['javascript', 'vue', 'html', 'css', 'git'],
      preferredJobTypes: ['part-time', 'internship'],
      preferredWorkModes: ['hybrid', 'remote'],
      preferredCategories: ['IT', 'Frontend', 'Web'],
      desiredJobTitles: ['Frontend Intern', 'Thực tập Frontend Developer'],
      preferredLocations: ['TP. Hồ Chí Minh'],
      salaryExpectation: { min: 3000000, max: 8000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: ['Website tìm kiếm & gợi ý việc làm cho sinh viên', 'Landing page giới thiệu CLB'],
      projectTechnologies: ['vue', 'nodejs', 'mongodb', 'express', 'javascript'],
      certifications: ['TOEIC 650'],
      resumeUrl: '/uploads/cv/student1.pdf',
      portfolioUrl: 'https://portfolio.example.com/student1',
      githubUrl: 'https://github.com/student1',
      linkedinUrl: 'https://linkedin.com/in/student1',
      bio: 'Sinh viên frontend, muốn tìm việc part-time/internship.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['TP. Hồ Chí Minh']),
      },
      isActive: true,
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
      gpa: 3.5,
      skills: ['marketing', 'content', 'seo', 'canva', 'facebook ads'],
      preferredJobTypes: ['part-time', 'internship', 'freelance'],
      preferredWorkModes: ['onsite', 'hybrid'],
      preferredCategories: ['Marketing', 'Content', 'Digital'],
      desiredJobTitles: ['Content Marketing Intern', 'Social Media Intern'],
      preferredLocations: ['Hà Nội'],
      salaryExpectation: { min: 2500000, max: 7000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: ['Kế hoạch nội dung TikTok cho CLB', 'SEO audit website ẩm thực'],
      projectTechnologies: ['seo', 'content', 'facebook ads', 'canva'],
      certifications: ['Google Analytics (Basic)'],
      resumeUrl: '/uploads/cv/student2.pdf',
      portfolioUrl: 'https://portfolio.example.com/student2',
      githubUrl: '',
      linkedinUrl: 'https://linkedin.com/in/student2',
      bio: 'Yêu thích content marketing và social media.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hà Nội']),
      },
      isActive: true,
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
      gpa: 3.1,
      skills: ['design', 'figma', 'photoshop', 'canva'],
      preferredJobTypes: ['part-time', 'internship', 'freelance'],
      preferredWorkModes: ['remote', 'hybrid'],
      preferredCategories: ['Design', 'UI/UX', 'Creative'],
      desiredJobTitles: ['UI/UX Intern', 'Graphic Designer Intern'],
      preferredLocations: ['Đà Nẵng'],
      salaryExpectation: { min: 2500000, max: 8000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: ['Thiết kế UI app quản lý công việc', 'Bộ nhận diện thương hiệu mini'],
      projectTechnologies: ['figma', 'photoshop', 'canva'],
      certifications: ['Adobe Photoshop (Basic)'],
      resumeUrl: '/uploads/cv/student3.pdf',
      portfolioUrl: 'https://portfolio.example.com/student3',
      githubUrl: '',
      linkedinUrl: '',
      bio: 'Thiết kế social post và UI cơ bản.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Đà Nẵng']),
      },
      isActive: true,
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
      university: 'Đại học Bách Khoa TP.HCM',
      academicYear: '4',
      graduationYear: 2026,
      gpa: 3.6,
      skills: ['java', 'spring', 'spring boot', 'sql', 'git', 'docker'],
      preferredJobTypes: ['internship', 'full-time'],
      preferredWorkModes: ['onsite', 'hybrid'],
      preferredCategories: ['IT', 'Backend', 'API'],
      desiredJobTitles: ['Java Backend Intern', 'Java Spring Intern', 'Junior Java Developer'],
      preferredLocations: ['TP. Hồ Chí Minh', 'Hà Nội'],
      salaryExpectation: { min: 6000000, max: 15000000, currency: 'VND' },
      experienceLevel: 'fresher',
      experienceMonths: 3,
      projects: ['API quản lý bán hàng', 'Hệ thống đặt phòng thư viện'],
      projectTechnologies: ['java', 'spring', 'spring boot', 'mysql', 'docker'],
      certifications: ['IELTS 6.0'],
      resumeUrl: '/uploads/cv/student4.pdf',
      portfolioUrl: '',
      githubUrl: 'https://github.com/student4',
      linkedinUrl: '',
      bio: 'Backend Java/Spring, thích xây API và làm việc với database.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['TP. Hồ Chí Minh']),
      },
      isActive: true,
    },
    {
      fullName: 'Vũ Đức Anh',
      email: 'student5@gmail.com',
      password: '123456',
      phone: '0901000005',
      birthday: new Date('2004-06-19'),
      address: 'Quận Ngô Quyền, Hải Phòng',
      studentId: 'SV005',
      major: 'Khoa học dữ liệu',
      university: 'Đại học Hàng Hải Việt Nam',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.3,
      skills: ['python', 'pandas', 'sql', 'excel', 'power bi', 'dashboard'],
      preferredJobTypes: ['internship', 'part-time'],
      preferredWorkModes: ['remote', 'hybrid'],
      preferredCategories: ['Data', 'Data Analyst', 'BI'],
      desiredJobTitles: ['Data Analyst Intern', 'BI Analyst Intern', 'Power BI Intern'],
      preferredLocations: ['Hải Phòng', 'Hà Nội', 'TP. Hồ Chí Minh'],
      salaryExpectation: { min: 4000000, max: 12000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: ['Dashboard phân tích doanh thu', 'Phân tích dữ liệu tuyển dụng'],
      projectTechnologies: ['python', 'pandas', 'power bi', 'sql', 'excel'],
      certifications: ['MOS Excel'],
      resumeUrl: '/uploads/cv/student5.pdf',
      portfolioUrl: '',
      githubUrl: 'https://github.com/student5',
      linkedinUrl: '',
      bio: 'Hứng thú với phân tích dữ liệu và dashboard.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hải Phòng']),
      },
      isActive: true,
    },
    {
      fullName: 'Ngô Gia Bảo',
      email: 'student6@gmail.com',
      password: '123456',
      phone: '0901000006',
      birthday: new Date('2003-04-30'),
      address: 'Quận Ninh Kiều, Cần Thơ',
      studentId: 'SV006',
      major: 'Hệ thống thông tin',
      university: 'Đại học Cần Thơ',
      academicYear: '4',
      graduationYear: 2026,
      gpa: 3.0,
      skills: ['c#', '.net', 'asp.net', 'sql', 'winforms', 'git'],
      preferredJobTypes: ['internship', 'full-time'],
      preferredWorkModes: ['onsite', 'hybrid'],
      preferredCategories: ['IT', 'Backend', 'Software'],
      desiredJobTitles: ['.NET Developer Intern', 'C# Developer Intern', 'Software Engineer Intern'],
      preferredLocations: ['Cần Thơ', 'TP. Hồ Chí Minh', 'Hà Nội'],
      salaryExpectation: { min: 5000000, max: 14000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: ['Ứng dụng quản lý thư viện WinForms', 'Website quản lý công việc nhóm'],
      projectTechnologies: ['c#', '.net', 'asp.net', 'sql', 'winforms'],
      certifications: ['TOEIC 600'],
      resumeUrl: '/uploads/cv/student6.pdf',
      portfolioUrl: '',
      githubUrl: 'https://github.com/student6',
      linkedinUrl: '',
      bio: 'Tập trung .NET/C#, muốn học hỏi môi trường thực tế.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Cần Thơ']),
      },
      isActive: true,
    },
    {
      fullName: 'Đặng Thị Mai',
      email: 'student7@gmail.com',
      password: '123456',
      phone: '0901000007',
      birthday: new Date('2004-10-10'),
      address: 'Quận Thanh Xuân, Hà Nội',
      studentId: 'SV007',
      major: 'Quản trị kinh doanh',
      university: 'Đại học Kinh tế Quốc dân',
      academicYear: '3',
      graduationYear: 2027,
      gpa: 3.4,
      skills: ['excel', 'presentation', 'communication', 'teamwork', 'sales', 'reporting'],
      preferredJobTypes: ['internship', 'part-time'],
      preferredWorkModes: ['onsite', 'hybrid'],
      preferredCategories: ['Business', 'Sales', 'Operations'],
      desiredJobTitles: [
        'Business Operations Intern',
        'Business Development Intern',
        'Operations Intern',
        'Sales Admin Intern',
      ],
      preferredLocations: ['Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng'],
      salaryExpectation: { min: 2500000, max: 7000000, currency: 'VND' },
      experienceLevel: 'none',
      experienceMonths: 0,
      projects: ['Kế hoạch kinh doanh TMĐT', 'Nghiên cứu thị trường ngành bán lẻ'],
      projectTechnologies: ['excel', 'powerpoint', 'reporting'],
      certifications: ['IELTS 5.5'],
      resumeUrl: '/uploads/cv/student7.pdf',
      portfolioUrl: '',
      githubUrl: '',
      linkedinUrl: '',
      bio: 'Yêu thích kinh doanh, muốn thử sức ở vị trí intern.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hà Nội']),
      },
      isActive: true,
    }
  ];
}

async function seedStudents({ reset = false } = {}) {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  if (reset) {
    const rs = await Student.deleteMany({
      $or: [
        { email: { $in: SEED_STUDENT_EMAILS } },
        { email: /@seed-student\.datn$/i },
        { email: /^datn\.student\d+@gmail\.com$/i },
      ],
    });
    console.log(`🧹 Đã xoá ${rs.deletedCount} student seed cũ`);
  }

  const seeds = buildStudentSeeds();

  let created = 0;
  let skipped = 0;

  for (const s of seeds) {
    const exists = await Student.findOne({ email: s.email.toLowerCase() });
    if (exists) {
      skipped += 1;
      continue;
    }

    // create() để chạy pre-save hash password
    await Student.create(s);
    created += 1;
  }

  console.log(`🎉 Seed student xong | created: ${created}, skipped: ${skipped}`);
  console.log('📌 Tài khoản test: student1@gmail.com ... student7@gmail.com | password: 123456');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const args = process.argv.slice(2);
const reset = args.includes('--reset');

seedStudents({ reset }).catch(async (err) => {
  console.error('❌ Lỗi seed students:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});