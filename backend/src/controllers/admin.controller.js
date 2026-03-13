const Employer = require('../models/Employer.model');
const Student = require('../models/Student.model');
const Admin = require('../models/Admin.model');
const Job = require('../models/Job.model');
const Report = require('../models/Report.model');
const { createNotification } = require('../utils/notification.service');

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

    return res.status(200).json({
      success: true,
      count: employers.length,
      employers,
    });
  } catch (error) {
    console.error('❌ Get pending employers error:', error);
    return res.status(500).json({
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

    return res.status(200).json({
      success: true,
      count: employers.length,
      employers,
    });
  } catch (error) {
    console.error('❌ Get all employers error:', error);
    return res.status(500).json({
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

    await createNotification({
      recipientId: employer._id,
      recipientRole: 'employer',
      recipientModel: 'Employer',
      title: 'Tài khoản nhà tuyển dụng đã được duyệt',
      message:
        'Admin đã xác thực tài khoản nhà tuyển dụng của bạn. Bạn có thể tiếp tục đăng tin và sử dụng hệ thống.',
      type: 'verification',
      link: '/employer',
      metadata: {
        employerId: employer._id.toString(),
        verified: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Xác thực thành công',
      employer,
    });
  } catch (error) {
    console.error('❌ Verify employer error:', error);
    return res.status(500).json({
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

    await createNotification({
      recipientId: employer._id,
      recipientRole: 'employer',
      recipientModel: 'Employer',
      title: 'Yêu cầu xác thực chưa được duyệt',
      message:
        'Admin đã từ chối yêu cầu xác thực tài khoản nhà tuyển dụng của bạn. Vui lòng kiểm tra lại thông tin hồ sơ.',
      type: 'verification',
      link: '/employer/profile',
      metadata: {
        employerId: employer._id.toString(),
        verified: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Đã từ chối xác thực',
      employer,
    });
  } catch (error) {
    console.error('❌ Reject employer error:', error);
    return res.status(500).json({
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

    return res.status(200).json({
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
    return res.status(500).json({
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

exports.getAllJobs = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate('employer', 'companyName email fullName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('❌ Get all jobs for admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách jobs',
      error: error.message,
    });
  }
};

exports.getJobDetailForAdmin = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId)
      .populate('employer', 'companyName email fullName phone industry');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('❌ Get job detail for admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải chi tiết job',
      error: error.message,
    });
  }
};

exports.toggleJobStatusByAdmin = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    job.status = job.status === 'active' ? 'closed' : 'active';
    await job.save();

    return res.status(200).json({
      success: true,
      message:
        job.status === 'active'
          ? 'Admin đã mở lại tin tuyển dụng'
          : 'Admin đã đóng tin tuyển dụng',
      job,
    });
  } catch (error) {
    console.error('❌ Toggle job status by admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái job',
      error: error.message,
    });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { status = 'all', targetType = 'all' } = req.query;

    const filter = {};
    if (status !== 'all') filter.status = status;
    if (targetType !== 'all') filter.targetType = targetType;

    const reports = await Report.find(filter)
      .populate('reporterId', 'fullName email companyName phone')
      .populate('targetId')
      .populate('relatedJob', 'title')
      .populate('relatedApplication', 'status createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error('❌ Get all reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách reports',
      error: error.message,
    });
  }
};

exports.getReportDetail = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate('reporterId', 'fullName email companyName phone')
      .populate('targetId')
      .populate('relatedJob', 'title')
      .populate('relatedApplication', 'status createdAt')
      .populate('handledBy', 'fullName email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy report',
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('❌ Get report detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải chi tiết report',
      error: error.message,
    });
  }
};

exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNote = '' } = req.body;

    const allowedStatuses = ['open', 'in_review', 'resolved', 'dismissed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái report không hợp lệ',
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy report',
      });
    }

    report.status = status;
    report.adminNote = adminNote;
    report.handledBy = req.user.userId;
    report.handledAt = new Date();

    await report.save();

    const reportStatusTextMap = {
      open: 'đã được mở lại',
      in_review: 'đang được xem xét',
      resolved: 'đã được xử lý',
      dismissed: 'đã bị từ chối',
    };

    await createNotification({
      recipientId: report.reporterId,
      recipientRole: report.reporterRole,
      recipientModel: report.reporterModel,
      title: 'Cập nhật trạng thái report',
      message: `Report của bạn ${reportStatusTextMap[status] || 'đã được cập nhật'}.`,
      type: 'report',
      link: report.reporterRole === 'student' ? '/student' : '/employer',
      metadata: {
        reportId: report._id.toString(),
        status,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái report thành công',
      report,
    });
  } catch (error) {
    console.error('❌ Update report status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái report',
      error: error.message,
    });
  }
};