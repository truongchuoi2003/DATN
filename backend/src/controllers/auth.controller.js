const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Admin = require('../models/Admin.model');
const jwt = require('jsonwebtoken');
const { findUserByIdAndRole } = require('../utils/user.helper');

// 📝 REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, birthday, phone, companyName } = req.body;

    console.log('📥 Register request:', { fullName, email, role, birthday, phone });

    // ✅ Validate input
    if (!fullName || !email || !password || !role  || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin ',
      });
    }

    // ✅ Validate role
    const validRoles = ['student', 'employer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ. Chỉ chấp nhận: student, employer',
      });
    }

    let user;
    let Model;
    let collectionName;

    // 🎯 Chọn Model dựa vào role
    if (role === 'student') {
      Model = Student;
      collectionName = 'Student';
      
    } else if (role === 'employer') {
      Model = Employer;
      collectionName = 'Employer';
      
      // Employer bắt buộc phải có companyName
      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: 'Nhà tuyển dụng phải có tên công ty',
        });
      }
      // Student bắt buộc birthday
      if (role === 'student' && !birthday) {
        return res.status(400).json({
          success: false,
          message: 'Sinh viên phải có ngày sinh',
        });
      }
    }

    // ✅ Check email đã tồn tại chưa
    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // ✅ Tạo user mới
    const userData = {
      fullName,
      email,
      password,
      phone,
    };

    // Thêm companyName nếu là employer
    if (role === 'employer') {
      userData.companyName = companyName;
    }
    // Chỉ student mới có birthday
    if (role === 'student') {
      userData.birthday = birthday;
    }

    user = new Model(userData);
    await user.save();

    console.log(`✅ ${collectionName} created:`, user._id);

    // ✅ Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, role: role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // ✅ Trả về response
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: role,
        companyName: user.companyName || null,
      },
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message,
    });
  }
};

// 🔐 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Login request:', { email });

    // ✅ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và password',
      });
    }

    let user = null;
    let role = null;

    // 🔍 Tìm user trong 3 collections
    // Thử tìm trong Student
    user = await Student.findOne({ email });
    if (user) {
      role = 'student';
    }

    // Nếu không có, thử tìm trong Employer
    if (!user) {
      user = await Employer.findOne({ email });
      if (user) {
        role = 'employer';
      }
    }

    // Nếu không có, thử tìm trong Admin
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) {
        role = 'admin';
      }
    }

    // ❌ Không tìm thấy user
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng',
      });
    }

    // ✅ Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng',
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    // ✅ Check tài khoản có active không
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    // ✅ Tạo JWT token
    const token = jwt.sign(
      { userId: user._id, role: role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log(`✅ Login successful (${role}):`, user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: role,
        companyName: user.companyName || null,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message,
    });
  }
};
exports.changePassword = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: 'Xác nhận mật khẩu mới không khớp',
      });
    }

    const found = await findUserByIdAndRole(userId, role);
    if (!found) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản',
      });
    }

    const { user } = found;

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};