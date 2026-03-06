const Employer = require('../models/Employer.model');
const Student = require('../models/Student.model');
const Admin = require('../models/Admin.model');
const Job = require('../models/Job.model');

const USER_MODELS = {
  student: Student,
  employer: Employer,
  admin: Admin,
};

const getModelByRole = (role) => USER_MODELS[role] || null;

// 📋 GET ALL EMPLOYERS (chưa xác thực)
exports.getPendingEmployers = async (req, res) => {
  try {
    const employers = await Employer.find({ verified: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employers.length,
      employers,
    });
  } catch (error) {
    console.error('❌ Get pending employers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET ALL EMPLOYERS (tất cả)
exports.getAllEmployers = async (req, res) => {
  try {
    const employers = await Employer.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employers.length,
      employers,
    });
  } catch (error) {
    console.error('❌ Get all employers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ✅ VERIFY EMPLOYER (Xác thực)
exports.verifyEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;

    const employer = await Employer.findByIdAndUpdate(
      employerId,
      { verified: true },
      { new: true }
    ).select('-password');

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà tuyển dụng',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xác thực thành công',
      employer,
    });
  } catch (error) {
    console.error('❌ Verify employer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ❌ REJECT EMPLOYER (Từ chối)
exports.rejectEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;

    const employer = await Employer.findByIdAndUpdate(
      employerId,
      { verified: false },
      { new: true }
    ).select('-password');

    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà tuyển dụng',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã từ chối xác thực',
      employer,
    });
  } catch (error) {
    console.error('❌ Reject employer error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📊 GET STATISTICS
exports.getStatistics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalEmployers = await Employer.countDocuments();
    const verifiedEmployers = await Employer.countDocuments({ verified: true });
    const pendingEmployers = await Employer.countDocuments({ verified: false });

    res.status(200).json({
      success: true,
      statistics: {
        totalStudents,
        totalEmployers,
        verifiedEmployers,
        pendingEmployers,
      },
    });
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 👥 GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const students = await Student.find().select('-password').lean();
    const employers = await Employer.find().select('-password').lean();
    const admins = await Admin.find().select('-password').lean();

    const users = [
      ...students.map((u) => ({ ...u, role: 'student' })),
      ...employers.map((u) => ({ ...u, role: 'employer' })),
      ...admins.map((u) => ({ ...u, role: 'admin' })),
    ];

    users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

exports.resetUserPasswordByAdmin = async (req, res) => {
  try {
    const { role, userId } = req.params;
    const { newPassword } = req.body;

    const Model = getModelByRole(role);
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ',
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Admin đã reset mật khẩu thành công',
    });
  } catch (error) {
    console.error('❌ Reset user password by admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const { role, userId } = req.params;

    const Model = getModelByRole(role);
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Role không hợp lệ',
      });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user',
      });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: user.isActive ? 'Mở khóa người dùng thành công' : 'Khóa người dùng thành công',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        role,
      },
    });
  } catch (error) {
    console.error('❌ Toggle user status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};