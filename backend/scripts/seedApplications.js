const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');
const Job = require('../src/models/Job.model');
const Application = require('../src/models/Application.model');
const Interaction = require('../src/models/Interaction.model');

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

async function clearSeedApplications() {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong backend/.env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Đã kết nối MongoDB');

  const students = await Student.find({
    email: { $in: SEED_STUDENT_EMAILS.map((e) => e.toLowerCase()) },
  }).select('_id email');

  const studentIds = students.map((s) => s._id);

  const deletedApplications = await Application.deleteMany({
    student: { $in: studentIds },
  });

  const deletedApplyInteractions = await Interaction.deleteMany({
    student: { $in: studentIds },
    interactionType: 'apply',
  });

  const jobReset = await Job.updateMany(
    { categories: 'seed-demo' },
    { $set: { applicationsCount: 0 } }
  );

  const remainApplications = await Application.countDocuments({
    student: { $in: studentIds },
  });

  const remainApplyInteractions = await Interaction.countDocuments({
    student: { $in: studentIds },
    interactionType: 'apply',
  });

  console.log(`🧹 Deleted applications: ${deletedApplications.deletedCount}`);
  console.log(`🧹 Deleted apply interactions: ${deletedApplyInteractions.deletedCount}`);
  console.log(`🔄 Reset applicationsCount cho jobs: ${jobReset.modifiedCount}`);
  console.log(`📭 Applications còn lại: ${remainApplications}`);
  console.log(`🚫 Apply interactions còn lại: ${remainApplyInteractions}`);
  console.log('ℹ️ Dataset recommender hiện được chốt ở trạng thái KHÔNG CÓ ứng tuyển ban đầu.');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

const { reset } = parseArgs();

clearSeedApplications({ reset }).catch(async (err) => {
  console.error('❌ Lỗi clear seed applications:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});