const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Employer = require('../src/models/Employer.model');

const CITY_COORDS = {
  'Hà Nội': [105.83416, 21.02776],
  'TP. Hồ Chí Minh': [106.70098, 10.77689],
  'Đà Nẵng': [108.20217, 16.05441],
  'Hải Phòng': [106.68808, 20.84491],
  'Cần Thơ': [105.78309, 10.04516],
};

const EMPLOYER_SEEDS = [
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
    city: 'TP. Hồ Chí Minh',
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
    city: 'Hà Nội',
    verified: true,
    isActive: true,
    emailVerified: true,
  },
  {
    fullName: 'HR Pixel Studio',
    email: 'hr3@gmail.com',
    password: '123456',
    phone: '0900000003',
    address: 'Hải Châu, Đà Nẵng',
    companyName: 'Pixel Studio',
    companySize: '11-50',
    industry: 'Thiết kế sáng tạo',
    website: 'https://pixelstudio.example.com',
    description: 'Studio thiết kế UI/UX, social media và sản phẩm số cho doanh nghiệp.',
    city: 'Đà Nẵng',
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
    city: 'Hải Phòng',
    verified: true,
    isActive: true,
    emailVerified: true,
  },
  {
    fullName: 'HR Mekong Analytics',
    email: 'hr5@gmail.com',
    password: '123456',
    phone: '0900000005',
    address: 'Ninh Kiều, Cần Thơ',
    companyName: 'Mekong Analytics',
    companySize: '11-50',
    industry: 'Dữ liệu & phần mềm',
    website: 'https://mekonganalytics.example.com',
    description: 'Đơn vị triển khai dashboard, báo cáo và phần mềm nội bộ cho SME.',
    city: 'Cần Thơ',
    verified: true,
    isActive: true,
    emailVerified: true,
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    reset: args.includes('--reset'),
  };
}

function jitterCoordinates([lng, lat], range = 0.03) {
  const lngOffset = (Math.random() - 0.5) * range;
  const latOffset = (Math.random() - 0.5) * range;

  return [
    Number((lng + lngOffset).toFixed(6)),
    Number((lat + latOffset).toFixed(6)),
  ];
}

async function seedEmployers({ reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  if (reset) {
    const emails = EMPLOYER_SEEDS.map((x) => x.email.toLowerCase());
    const rs = await Employer.deleteMany({ email: { $in: emails } });
    console.log(`🧹 Đã xoá ${rs.deletedCount} employer demo cũ`);
  }

  let created = 0;
  let skipped = 0;

  for (const item of EMPLOYER_SEEDS) {
    const exists = await Employer.findOne({ email: item.email.toLowerCase() }).select('_id');
    if (exists) {
      skipped += 1;
      continue;
    }

    await Employer.create({
      fullName: item.fullName,
      email: item.email,
      password: item.password,
      phone: item.phone,
      address: item.address,
      companyName: item.companyName,
      companySize: item.companySize,
      industry: item.industry,
      website: item.website,
      description: item.description,
      location: {
        type: 'Point',
        coordinates: jitterCoordinates(CITY_COORDS[item.city]),
      },
      verified: item.verified,
      isActive: item.isActive,
      emailVerified: item.emailVerified,
    });

    created += 1;
  }

  console.log(`🎉 Seed employer xong | created: ${created} | skipped: ${skipped}`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { reset } = parseArgs();

seedEmployers({ reset }).catch(async (err) => {
  console.error('❌ Lỗi seed employers:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});