const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const Student = require('../models/Student.model');
const mongoose = require('mongoose');

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
};exports.applyForJob = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { jobId, coverLetter, expectedSalary, availableFrom, additionalInfo } = req.body;

    if (role !== 'student') {
      return res.status(403).json({ success: false, message: 'Chỉ sinh viên mới có thể ứng tuyển' });
    }

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'JobId không hợp lệ' });
    }

    const job = await Job.findById(jobId).populate('employer');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tin tuyển dụng' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Tin tuyển dụng này đã đóng' });
    }

    const student = await Student.findById(userId);
    if (!student?.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng tải CV lên profile trước khi ứng tuyển',
      });
    }

    const existingApplication = await Application.findOne({ job: jobId, student: userId });

    // ✅ Nếu đã từng rút đơn -> cho phép ứng tuyển lại bằng cách "reset" đơn cũ
    if (existingApplication) {
      if (existingApplication.status !== 'withdrawn') {
        return res.status(400).json({ success: false, message: 'Bạn đã ứng tuyển vị trí này rồi' });
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

      // để list/sort hiển thị như đơn mới
      existingApplication.appliedAt = new Date();
      existingApplication.createdAt = new Date();

      await existingApplication.save();

      job.applicationsCount += 1;
      await job.save();

      await existingApplication.populate([
        { path: 'student', select: 'fullName email phone university major' },
        { path: 'job', select: 'title location salary' },
      ]);

      return res.status(200).json({
        success: true,
        message: 'Ứng tuyển lại thành công! 🎉',
        application: existingApplication,
      });
    }

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
    });

    await application.save();

    job.applicationsCount += 1;
    await job.save();

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
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
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

    // hỗ trợ limit/sort (Student.vue đang gọi limit=3&sort=-createdAt)
    const limitNum = Math.min(parseInt(limit || '0', 10) || 0, 50);
    const sortVal = typeof sort === 'string' && sort.trim() ? sort.trim() : '-createdAt';

    let query = Application.find(filter)
      .populate({
        path: 'job',
        populate: { path: 'employer', select: 'companyName logo email' },
      })
      .sort(sortVal);

    if (limitNum > 0) query = query.limit(limitNum);

    const applications = await query;

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('❌ Get my applications error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
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

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ success: false, message: 'ApplicationId không hợp lệ' });
    }

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn ứng tuyển' });
    }

    if (application.student.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền rút đơn này' });
    }

    if (application.status === 'accepted') {
      return res.status(400).json({ success: false, message: 'Không thể rút đơn đã được chấp nhận' });
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

    // đang dùng applicationsCount như "số đơn còn hiệu lực" => trừ 1
    await Job.findByIdAndUpdate(application.job, { $inc: { applicationsCount: -1 } });
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
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};


// 📊 GET APPLICATION STATISTICS (Student)
exports.getMyApplicationStats = async (req, res) => {
  try {
    const { userId } = req.user;

    // ✅ total mặc định không tính withdrawn (vì list đã ẩn withdrawn)
    const total = await Application.countDocuments({ student: userId, status: { $ne: 'withdrawn' } });
    const pending = await Application.countDocuments({ student: userId, status: 'pending' });
    const reviewing = await Application.countDocuments({ student: userId, status: 'reviewing' });
    const accepted = await Application.countDocuments({ student: userId, status: 'accepted' });
    const rejected = await Application.countDocuments({ student: userId, status: 'rejected' });
    const withdrawn = await Application.countDocuments({ student: userId, status: 'withdrawn' });

    const statsObj = { total, pending, reviewing, accepted, rejected, withdrawn };

    return res.status(200).json({
      success: true,
      // ✅ Student.vue đang đọc res.data.stats
      stats: statsObj,
      // ✅ giữ lại để tương thích các chỗ khác
      statistics: statsObj,
    });
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};


// ✅ CHECK IF APPLIED (Student)
exports.checkIfApplied = async (req, res) => {
  try {
    const { userId } = req.user;
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: 'JobId không hợp lệ' });
    }

    // ✅ chỉ tính là "đã apply" nếu trạng thái KHÔNG phải withdrawn
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
    return res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};
