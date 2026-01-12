require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin.model');

// 🔧 Thông tin admin - BẠN CÓ THỂ SỬA Ở ĐÂY
const ADMIN_DATA = {
  fullName: 'Admin DATN',
  email: 'admin@datn.com',
  password: '123456',
  phone: '0123456789',
  permissions: ['all'],
  role: 'super_admin',
};

const createAdmin = async () => {
  try {
    console.log('🚀 Bắt đầu tạo tài khoản Admin...\n');

    // Kết nối database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công\n');

    // Kiểm tra admin đã tồn tại chưa
    const existingAdmin = await Admin.findOne({ email: ADMIN_DATA.email });

    if (existingAdmin) {
      console.log('⚠️  Admin đã tồn tại trong collection "admin"!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Full Name:', existingAdmin.fullName);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('📅 Created At:', existingAdmin.createdAt);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // Tạo admin mới
    const admin = new Admin(ADMIN_DATA);
    await admin.save();

    console.log('🎉 TẠO ADMIN THÀNH CÔNG!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:     ', ADMIN_DATA.email);
    console.log('🔒 Password:  ', ADMIN_DATA.password);
    console.log('👤 Full Name: ', ADMIN_DATA.fullName);
    console.log('🔑 Role:      ', ADMIN_DATA.role);
    console.log('📞 Phone:     ', ADMIN_DATA.phone || 'Chưa có');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  LƯU Ý: Hãy đổi password sau khi đăng nhập lần đầu!\n');
    console.log('🌐 Đăng nhập tại: http://localhost:5173/login\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ LỖI KHI TẠO ADMIN:', error.message);
    console.error('\n📋 Chi tiết lỗi:', error);
    
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Chạy script
createAdmin();