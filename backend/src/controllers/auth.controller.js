const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Admin = require('../models/Admin.model');
const jwt = require('jsonwebtoken');

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const findExistingUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  const [student, employer, admin] = await Promise.all([
    Student.findOne({ email: normalizedEmail }).select('_id email'),
    Employer.findOne({ email: normalizedEmail }).select('_id email'),
    Admin.findOne({ email: normalizedEmail }).select('_id email'),
  ]);

  if (student) return { role: 'student', user: student };
  if (employer) return { role: 'employer', user: employer };
  if (admin) return { role: 'admin', user: admin };

  return null;
};

// 📝 REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role, birthday, phone, companyName } = req.body;
    const normalizedEmail = normalizeEmail(email);

    console.log('📥 Register request:', { fullName, email, role, birthday, phone });

    if (!fullName || !email || !password || !role || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin ',
      });
    }

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

    if (role === 'student') {
      Model = Student;
      collectionName = 'Student';

      if (!birthday) {
        return res.status(400).json({
          success: false,
          message: 'Sinh viên phải có ngày sinh',
        });
      }
    } else if (role === 'employer') {
      Model = Employer;
      collectionName = 'Employer';

      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: 'Nhà tuyển dụng phải có tên công ty',
        });
      }
    }

    const existingUser = await findExistingUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    const userData = {
      fullName,
      email: normalizedEmail,
      password,
      phone,
    };

    if (role === 'employer') {
      userData.companyName = companyName;
    }

    if (role === 'student') {
      userData.birthday = birthday;
    }

    user = new Model(userData);
    await user.save();

    console.log(`✅ ${collectionName} created:`, user._id);

    const token = jwt.sign(
      { userId: user._id, role: role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

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
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

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
    const normalizedEmail = normalizeEmail(email);

    console.log('📥 Login request:', { email });

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và password',
      });
    }

    let user = null;
    let role = null;

    user = await Student.findOne({ email: normalizedEmail });
    if (user) {
      role = 'student';
    }

    if (!user) {
      user = await Employer.findOne({ email: normalizedEmail });
      if (user) {
        role = 'employer';
      }
    }

    if (!user) {
      user = await Admin.findOne({ email: normalizedEmail });
      if (user) {
        role = 'admin';
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không đúng',
      });
    }

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