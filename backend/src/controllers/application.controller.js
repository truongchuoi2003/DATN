const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const Student = require('../models/Student.model');
const Interaction = require('../models/Interaction.model');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createInteractionLog = async ({
  studentId,
  jobId,
  interactionType,
  source = 'web',
  metadata = {},
}) => {
  try {
    return await Interaction.create({
      student: studentId,
      job: jobId,
      interactionType,
      source,
      metadata,
    });
  } catch (error) {
    console.error(`❌ Failed to log interaction [${interactionType}]:`, error.message);
    return null;
  }
};

const buildSort = (sortQuery) => {
  // Chỉ cho phép sort các field an toàn
  const allowedFields = ['createdAt', 'updatedAt', 'appliedAt', 'status'];
  const sortStr = typeof sortQuery === 'string' && sortQuery.trim() ? sortQuery.trim() : '-createdAt';

  const direction = sortStr.startsWith('-') ? -1 : 1;
  const field = sortStr.replace(/^-/, '');

  if (!allowedFields.includes(field)) {
    return { createdAt: -1 };
  }

  return { [field]: direction };
};

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

    if (!jobId || !isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
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

    // (Khuyên dùng) chặn apply job đã hết hạn
    if (job.deadline && new Date(job.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Tin tuyển dụng đã hết hạn',
      });
    }

    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ sinh viên',
      });
    }

    if (!student.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải CV lên profile trước khi ứng tuyển',
      });
    }

    const existingApplication = await Application.findOne({
      job: jobId,
      student: userId,
    });

    // ✅ Nếu đã từng rút đơn -> cho phép ứng tuyển lại bằng cách reset đơn cũ
    if (existingApplication) {
      if (existingApplication.status !== 'withdrawn') {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã ứng tuyển vị trí này rồi',
        });
      }

      existingApplication.status = 'pending';
      existingApplication.coverLetter = coverLetter || '';
      existingApplication.resumeUrl = student.resumeUrl;
      existingApplication.expectedSalary = expectedSalary || null;
      existingApplication.availableFrom = availableFrom || null;
      existingApplication.additionalInfo = additionalInfo || null;

      existingApplication.employer = job.employer._id;
      existingApplication.employerNote = '';
      existingApplication.reviewedAt = null;

      // Dùng appliedAt để đánh dấu lần apply mới (createdAt có thể immutable)
      existingApplication.appliedAt = new Date();

      await existingApplication.save();

      // tăng số đơn còn hiệu lực
      await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

      await createInteractionLog({
        studentId: userId,
        jobId: job._id,
        interactionType: 'apply',
        source: 'web',
        metadata: {
          applicationId: existingApplication._id.toString(),
          reapplied: true,
        },
      });
      await existingApplication.populate([
        { path: 'student', select: 'fullName email phone university major' },
        { path: 'job', select: 'title location salary' },
      ]);

      return res.status(200).json({
        success: true,
        message: 'Ứng tuyển lại thành công! 🎉',
        application: existingApplication,
      });}
      
    // ✅ Apply lần đầu
    const application = new Application({
      job: jobId,
      student: userId,
      employer: job.employer._id,
      coverLetter: coverLetter || '',
      resumeUrl: student.resumeUrl,
      expectedSalary: expectedSalary || null,
      availableFrom: availableFrom || null,
      additionalInfo: additionalInfo || null,
      appliedAt: new Date(),
    });

    await application.save();

    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    await createInteractionLog({
      studentId: userId,
      jobId: job._id,
      interactionType: 'apply',
      source: 'web',
      metadata: {
        applicationId: application._id.toString(),
      },
    });

    await application.populate([
      { path: 'student', select: 'fullName email phone university major' },
      { path: 'job', select: 'title location salary' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Ứng tuyển thành công! 🎉',
      application,
    });
  } catch (error) {
    console.error('❌ Apply for job error:', error);
    return res.status(500).json({
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
    const { status, limit, sort } = req.query;

    const filter = { student: userId };

    // ✅ Mặc định: ẩn đơn đã rút
    if (status) {
      filter.status = status; // muốn xem withdrawn: ?status=withdrawn
    } else {
      filter.status = { $ne: 'withdrawn' };
    }

    const limitNum = Math.min(parseInt(limit || '0', 10) || 0, 50);
    const sortObj = buildSort(sort);

    let query = Application.find(filter)
      .populate({
        path: 'job',
        populate: { path: 'employer', select: 'companyName logo email' },
      })
      .sort(sortObj);

    if (limitNum > 0) query = query.limit(limitNum);

    const applications = await query;

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Get my applications error:', error);
    return res.status(500).json({
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

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

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

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Get job applications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET ALL APPLICATIONS OF EMPLOYER
exports.getEmployerApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status } = req.query;

    const filter = {
      employer: userId,
      status: { $ne: 'withdrawn' },
    };

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('student', 'fullName email phone university major gpa skills resumeUrl avatar')
      .populate('job', 'title location jobType level status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Get employer applications error:', error);
    return res.status(500).json({
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

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

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

    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Không thể cập nhật đơn đã rút',
      });
    }

    application.status = status;
    application.employerNote = employerNote || '';
    application.reviewedAt = new Date();

    await application.save();
    await application.populate('student', 'fullName email phone university major');

    return res.status(200).json({
      success: true,
      message:
        status === 'accepted'
          ? 'Đã chấp nhận ứng viên'
          : status === 'rejected'
            ? 'Đã từ chối ứng viên'
            : 'Đã đánh dấu đang xem xét',
      application,
    });
  } catch (error) {
    console.error('❌ Update application status error:', error);
    return res.status(500).json({
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

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

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

    // ✅ Nếu đã rút rồi thì không trừ count lần nữa
    if (application.status === 'withdrawn') {
      return res.status(200).json({
        success: true,
        message: 'Đơn này đã được rút trước đó',
        application,
      });
    }

    application.status = 'withdrawn';
    await application.save();

    // applicationsCount = số đơn còn hiệu lực => trừ 1
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });

    // chống âm
    await Job.updateOne(
      { _id: application.job, applicationsCount: { $lt: 0 } },
      { $set: { applicationsCount: 0 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Đã rút đơn ứng tuyển',
      application,
    });
  } catch (error) {
    console.error('❌ Withdraw application error:', error);
    return res.status(500).json({
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

    // ✅ total mặc định không tính withdrawn
    const total = await Application.countDocuments({
      student: userId,
      status: { $ne: 'withdrawn' },
    });

    const pending = await Application.countDocuments({ student: userId, status: 'pending' });
    const reviewing = await Application.countDocuments({ student: userId, status: 'reviewing' });
    const accepted = await Application.countDocuments({ student: userId, status: 'accepted' });
    const rejected = await Application.countDocuments({ student: userId, status: 'rejected' });
    const withdrawn = await Application.countDocuments({ student: userId, status: 'withdrawn' });

    const statsObj = { total, pending, reviewing, accepted, rejected, withdrawn };

    return res.status(200).json({
      success: true,
      stats: statsObj,       // Student.vue đang đọc res.data.stats
      statistics: statsObj,  // giữ tương thích chỗ khác
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

// ✅ CHECK IF APPLIED (Student)
exports.checkIfApplied = async (req, res) => {
  try {
    const { userId } = req.user;
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

    // ✅ Chỉ tính là "đã apply" nếu KHÔNG phải withdrawn
    const application = await Application.findOne({
      job: jobId,
      student: userId,
      status: { $ne: 'withdrawn' },
    });

    return res.status(200).json({
      success: true,
      hasApplied: !!application,
      application: application || null,
    });
  } catch (error) {
    console.error('❌ Check if applied error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};