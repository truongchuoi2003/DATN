const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const Student = require('../models/Student.model');

// 📋 APPLY FOR JOB (Student only)
exports.applyForJob = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { jobId, coverLetter, expectedSalary, availableFrom, additionalInfo } = req.body;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể ứng tuyển',
      });
    }

    const job = await Job.findById(jobId).populate('employer');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Tin tuyển dụng này đã đóng',
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      student: userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã ứng tuyển vị trí này rồi',
      });
    }

    const student = await Student.findById(userId);
    if (!student.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải CV lên profile trước khi ứng tuyển',
      });
    }

    const application = new Application({
      job: jobId,
      student: userId,
      employer: job.employer._id,
      coverLetter: coverLetter || '',
      resumeUrl: student.resumeUrl,
      expectedSalary: expectedSalary || null,
      availableFrom: availableFrom || null,
      additionalInfo: additionalInfo || null,
    });

    await application.save();

    job.applicationsCount += 1;
    await job.save();

    await application.populate([
      { path: 'student', select: 'fullName email phone university major' },
      { path: 'job', select: 'title location salary' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Ứng tuyển thành công! 🎉',
      application,
    });
  } catch (error) {
    console.error('❌ Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET MY APPLICATIONS (Student)
exports.getMyApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status } = req.query;

    const filter = { student: userId };
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate({
        path: 'job',
        populate: { path: 'employer', select: 'companyName logo email' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET JOB APPLICATIONS (Employer)
exports.getJobApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { jobId } = req.params;
    const { status } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    if (job.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem ứng viên của tin này',
      });
    }

    const filter = { job: jobId };
    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('student', 'fullName email phone university major gpa skills resumeUrl avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ✅ UPDATE APPLICATION STATUS (Employer)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { status, employerNote } = req.body;

    const validStatuses = ['reviewing', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    const application = await Application.findById(applicationId)
      .populate('job')
      .populate('student', 'fullName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi trạng thái đơn này',
      });
    }

    application.status = status;
    application.employerNote = employerNote || '';
    application.reviewedAt = new Date();
    await application.save();

    await application.populate('student', 'fullName email phone university major');

    res.status(200).json({
      success: true,
      message: `Đã ${status === 'accepted' ? 'chấp nhận' : status === 'rejected' ? 'từ chối' : 'đánh dấu đang xem xét'} ứng viên`,
      application,
    });
  } catch (error) {
    console.error('❌ Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 🗑️ WITHDRAW APPLICATION (Student)
exports.withdrawApplication = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.student.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền rút đơn này',
      });
    }

    if (application.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Không thể rút đơn đã được chấp nhận',
      });
    }

    application.status = 'withdrawn';
    await application.save();

    await Job.findByIdAndUpdate(application.job, {
      $inc: { applicationsCount: -1 },
    });

    res.status(200).json({
      success: true,
      message: 'Đã rút đơn ứng tuyển',
      application,
    });
  } catch (error) {
    console.error('❌ Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📊 GET APPLICATION STATISTICS (Student)
exports.getMyApplicationStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const total = await Application.countDocuments({ student: userId });
    const pending = await Application.countDocuments({ student: userId, status: 'pending' });
    const reviewing = await Application.countDocuments({ student: userId, status: 'reviewing' });
    const accepted = await Application.countDocuments({ student: userId, status: 'accepted' });
    const rejected = await Application.countDocuments({ student: userId, status: 'rejected' });

    res.status(200).json({
      success: true,
      statistics: {
        total,
        pending,
        reviewing,
        accepted,
        rejected,
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

// ✅ CHECK IF APPLIED (Student)
exports.checkIfApplied = async (req, res) => {
  try {
    const { userId } = req.user;
    const { jobId } = req.params;

    const application = await Application.findOne({
      job: jobId,
      student: userId,
    });

    res.status(200).json({
      success: true,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error('❌ Check if applied error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};