const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Employer = require('../src/models/Employer.model');

const INDUSTRIES = [
  'Công nghệ thông tin',
  'Marketing',
  'Thiết kế sáng tạo',
  'Giáo dục',
  'Thương mại điện tử',
  'Dịch vụ khách hàng',
  'Bán lẻ',
  'Logistics',
  'Phân tích dữ liệu',
  'Nhân sự',
];

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500'];

const CITIES = [
  {
    city: 'TP. Hồ Chí Minh',
    addressSamples: [
      'Quận 1, TP. Hồ Chí Minh',
      'Bình Thạnh, TP. Hồ Chí Minh',
      'TP. Thủ Đức, TP. Hồ Chí Minh',
      'Tân Bình, TP. Hồ Chí Minh',
    ],
    coords: [106.70098, 10.77689],
  },
  {
    city: 'Hà Nội',
    addressSamples: [
      'Cầu Giấy, Hà Nội',
      'Nam Từ Liêm, Hà Nội',
      'Hai Bà Trưng, Hà Nội',
      'Đống Đa, Hà Nội',
    ],
    coords: [105.83416, 21.02776],
  },
  {
    city: 'Đà Nẵng',
    addressSamples: [
      'Hải Châu, Đà Nẵng',
      'Thanh Khê, Đà Nẵng',
      'Sơn Trà, Đà Nẵng',
    ],
    coords: [108.20217, 16.05441],
  },
  {
    city: 'Cần Thơ',
    addressSamples: [
      'Ninh Kiều, Cần Thơ',
      'Bình Thủy, Cần Thơ',
    ],
    coords: [105.78309, 10.04516],
  },
  {
    city: 'Hải Phòng',
    addressSamples: [
      'Ngô Quyền, Hải Phòng',
      'Lê Chân, Hải Phòng',
    ],
    coords: [106.68808, 20.84491],
  },
];

const COMPANY_WORDS_A = [
  'Nova',
  'Blue',
  'Delta',
  'Vina',
  'Smart',
  'Top',
  'Next',
  'Green',
  'Urban',
  'Prime',
  'Talent',
  'Bright',
];

const COMPANY_WORDS_B = [
  'Works',
  'Solutions',
  'Studio',
  'Media',
  'Hub',
  'Tech',
  'Logistics',
  'Labs',
  'Service',
  'Group',
  'Commerce',
  'Digital',
];

const buildPendingEmployerEmail = (index) => {
  const runningNo = String(index + 1).padStart(2, '0');
  return `hr${runningNo}@gmail.com`.toLowerCase();
};

const PENDING_EMPLOYER_EMAIL_REGEX = /^hr\d{2}@gmail\.com$/i;

function parseArgs() {
  const args = process.argv.slice(2);
  const countArg = args.find((arg) => arg.startsWith('--count='));
  const count = countArg ? Number(countArg.split('=')[1]) : 8;

  return {
    count: Number.isFinite(count) && count > 0 ? count : 8,
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

function slugify(text = '') {
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function jitterCoordinates([lng, lat]) {
  const offsetLng = (Math.random() - 0.5) * 0.08;
  const offsetLat = (Math.random() - 0.5) * 0.08;
  return [Number((lng + offsetLng).toFixed(6)), Number((lat + offsetLat).toFixed(6))];
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function buildEmployerSeed(index) {
  const wordA = COMPANY_WORDS_A[index % COMPANY_WORDS_A.length];
  const wordB = COMPANY_WORDS_B[Math.floor(index / COMPANY_WORDS_A.length) % COMPANY_WORDS_B.length];
  const cityData = CITIES[index % CITIES.length];
  const companyName = `${wordA} ${wordB}`;
  const repName = `HR ${companyName}`;
  const industry = INDUSTRIES[index % INDUSTRIES.length];
  const companySize = COMPANY_SIZES[index % COMPANY_SIZES.length];
  const address = randomChoice(cityData.addressSamples);
  const slug = slugify(companyName);
  const email = buildPendingEmployerEmail(index);

  return {
    fullName: repName,
    email,
    password: '123456',
    phone: `09${String(10000000 + index).padStart(8, '0')}`,
    address,
    companyName,
    companySize,
    industry,
    website: `https://${slug}.example.com`,
    description: `${companyName} đang hoàn thiện hồ sơ doanh nghiệp để tham gia tuyển dụng trên hệ thống. Đây là tài khoản seed phục vụ demo trạng thái chờ admin xác thực.`,
    taxCode: `031${String(1000000 + index).padStart(7, '0')}`,
    location: {
      type: 'Point',
      coordinates: jitterCoordinates(cityData.coords),
    },
    verified: false,
    isActive: true,
    emailVerified: true,
    createdAt: daysAgo(randomInt(1, 30)),
    updatedAt: new Date(),
  };
}

async function seedPendingEmployers({ count = 8, reset = false } = {}) {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  if (reset) {
    const deleted = await Employer.deleteMany({
      email: PENDING_EMPLOYER_EMAIL_REGEX,
      verified: false,
    });
    console.log(`🧹 Đã xóa ${deleted.deletedCount} employer pending seed cũ`);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < count; i += 1) {
    const seed = buildEmployerSeed(i);

    const exists = await Employer.findOne({ email: seed.email }).select('_id');
    if (exists) {
      skipped += 1;
      continue;
    }

    const employer = new Employer(seed);
    await employer.save();
    created += 1;
  }

  const pendingCount = await Employer.countDocuments({ verified: false });
  const totalCount = await Employer.countDocuments();

  console.log(`✅ Đã tạo mới ${created} employer pending`);
  console.log(`⏭️ Bỏ qua ${skipped} employer đã tồn tại`);
  console.log(`📌 Tổng employer pending hiện tại: ${pendingCount}`);
  console.log(`📌 Tổng employer toàn hệ thống: ${totalCount}`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt MongoDB');
}

const { count, reset } = parseArgs();

seedPendingEmployers({ count, reset }).catch(async (error) => {
  console.error('❌ Seed pending employers thất bại:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});