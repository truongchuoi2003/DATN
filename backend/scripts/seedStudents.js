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
      graduationYear: 2027,
      gpa: 3.2,
      skills: ['javascript', 'vue', 'html', 'css', 'git'],
      resumeUrl: '/uploads/cv/student1.pdf',
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
      graduationYear: 2026,
      gpa: 3.5,
      skills: ['marketing', 'content', 'seo', 'canva', 'facebook ads'],
      resumeUrl: '/uploads/cv/student2.pdf',
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
      graduationYear: 2027,
      gpa: 3.1,
      skills: ['design', 'figma', 'photoshop', 'canva'],
      resumeUrl: '/uploads/cv/student3.pdf',
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
      birthday: new Date('2003-11-19'),
      address: 'Quận Ninh Kiều, Cần Thơ',
      studentId: 'SV004',
      major: 'Kế toán',
      university: 'Đại học Cần Thơ',
      graduationYear: 2026,
      gpa: 3.4,
      skills: ['excel', 'accounting', 'data entry', 'word'],
      resumeUrl: '/uploads/cv/student4.pdf',
      bio: 'Tìm việc part-time nhập liệu/kế toán.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Cần Thơ']),
      },
      isActive: true,
    },
    {
      fullName: 'Đỗ Gia Bảo',
      email: 'student5@gmail.com',
      password: '123456',
      phone: '0901000005',
      birthday: new Date('2005-02-09'),
      address: 'TP. Thủ Đức, TP. Hồ Chí Minh',
      studentId: 'SV005',
      major: 'Khoa học máy tính',
      university: 'Đại học Khoa học Tự nhiên',
      graduationYear: 2028,
      gpa: 3.0,
      skills: ['nodejs', 'express', 'mongodb', 'api', 'javascript'],
      resumeUrl: '/uploads/cv/student5.pdf',
      bio: 'Backend intern / part-time dev.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['TP. Hồ Chí Minh']),
      },
      isActive: true,
    },
    {
      fullName: 'Ngô Hải Yến',
      email: 'student6@gmail.com',
      password: '123456',
      phone: '0901000006',
      birthday: new Date('2004-06-30'),
      address: 'Quận Ngô Quyền, Hải Phòng',
      studentId: 'SV006',
      major: 'Quản trị kinh doanh',
      university: 'Đại học Hàng hải Việt Nam',
      graduationYear: 2027,
      gpa: 3.15,
      skills: ['communication', 'customer service', 'excel'],
      resumeUrl: '/uploads/cv/student6.pdf',
      bio: 'Muốn tìm việc part-time CSKH/bán hàng.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['Hải Phòng']),
      },
      isActive: true,
    },
    // Hồ sơ yếu để test fallback recommender
    {
      fullName: 'Võ Khánh Linh',
      email: 'student7@gmail.com',
      password: '123456',
      phone: '0901000007',
      birthday: new Date('2005-09-14'),
      studentId: 'SV007',
      university: 'Đại học Mở TP.HCM',
      graduationYear: 2027,
      gpa: 2.9,
      skills: [],
      resumeUrl: '/uploads/cv/student7.pdf',
      bio: 'Sinh viên mới tạo hồ sơ.',
      location: {
        type: 'Point',
        coordinates: addJitter(CITY_COORDS['TP. Hồ Chí Minh']),
      },
      isActive: true,
    },
  ];
}

async function seedStudents({ reset = false }) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

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