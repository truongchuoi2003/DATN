const Employer = require('../models/Employer.model');
const Student = require('../models/Student.model');
const Admin = require('../models/Admin.model');

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

    // Add role field
    const studentsWithRole = students.map(s => ({ ...s, role: 'student' }));
    const employersWithRole = employers.map(e => ({ ...e, role: 'employer' }));
    const adminsWithRole = admins.map(a => ({ ...a, role: 'admin' }));

    const allUsers = [...studentsWithRole, ...employersWithRole, ...adminsWithRole];

    res.status(200).json({
      success: true,
      count: allUsers.length,
      users: allUsers,
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};