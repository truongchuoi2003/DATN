const Application = require('../models/Application.model');
const Job = require('../models/Job.model');
const Student = require('../models/Student.model');
const Interaction = require('../models/Interaction.model');
const mongoose = require('mongoose');
const { createNotification } = require('../utils/notification.service');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const EMPLOYER_ALLOWED_TRANSITIONS = {
  pending: ['reviewing', 'shortlisted', 'rejected'],
  reviewing: ['shortlisted', 'interviewing', 'rejected'],
  shortlisted: ['interviewing', 'offered', 'rejected'],
  interviewing: ['offered', 'hired', 'rejected'],
  offered: ['hired', 'rejected'],
  hired: [],
  rejected: [],
  withdrawn: [],
};

const STUDENT_WITHDRAW_ALLOWED = ['pending', 'reviewing', 'shortlisted'];

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
  const allowedFields = ['createdAt', 'updatedAt', 'appliedAt', 'status', 'reviewedAt'];
  const sortStr =
    typeof sortQuery === 'string' && sortQuery.trim() ? sortQuery.trim() : '-createdAt';

  const direction = sortStr.startsWith('-') ? -1 : 1;
  const field = sortStr.replace(/^-/, '');

  if (!allowedFields.includes(field)) {
    return { createdAt: -1 };
  }

  return { [field]: direction };
};

const buildEmployerFilter = (userId, status) => {
  const filter = {
    employer: userId,
    status: { $ne: 'withdrawn' },
  };

  if (status) {
    filter.status = status;
  }

  return filter;
};

const populateApplicationDetail = (query) =>
  query
    .populate('student', 'fullName email phone university major gpa skills resumeUrl avatar')
    .populate('job', 'title location salary jobType level status deadline employer')
    .populate({
      path: 'job',
      populate: { path: 'employer', select: 'companyName logo email companySize industry' },
    });

const removeBrokenApplications = async (applications = []) => {
  const brokenIds = applications
    .filter((app) => !app?.student || !app?.job)
    .map((app) => app._id);

  if (brokenIds.length) {
    await Application.deleteMany({
      _id: { $in: brokenIds },
    });
  }

  return applications.filter((app) => app?.student && app?.job);
};

const canEmployerTransition = (currentStatus, nextStatus) => {
  const allowed = EMPLOYER_ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
};

// APPLY FOR JOB
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
      existingApplication.appliedAt = new Date();
      existingApplication.interview = {
        status: 'none',
        scheduledAt: null,
        mode: 'online',
        location: '',
        meetingLink: '',
        note: '',
        scheduledBy: null,
        respondedAt: null,
        cancelledAt: null,
      };

      await existingApplication.save();
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

      await createNotification({
        recipientId: job.employer._id,
        recipientRole: 'employer',
        recipientModel: 'Employer',
        title: 'Có đơn ứng tuyển lại',
        message: `${student.fullName} đã ứng tuyển lại vào vị trí "${job.title}".`,
        type: 'application',
        link: `/employer/applications/${job._id}`,
        metadata: {
          applicationId: existingApplication._id.toString(),
          jobId: job._id.toString(),
          studentId: student._id.toString(),
          reapplied: true,
        },
      });

      const refreshedApplication = await populateApplicationDetail(
        Application.findById(existingApplication._id)
      );

      return res.status(200).json({
        success: true,
        message: 'Ứng tuyển lại thành công! 🎉',
        application: refreshedApplication,
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
      appliedAt: new Date(),
      interview: {
        status: 'none',
      },
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

    await createNotification({
      recipientId: job.employer._id,
      recipientRole: 'employer',
      recipientModel: 'Employer',
      title: 'Có đơn ứng tuyển mới',
      message: `${student.fullName} vừa ứng tuyển vào vị trí "${job.title}".`,
      type: 'application',
      link: `/employer/applications/${job._id}`,
      metadata: {
        applicationId: application._id.toString(),
        jobId: job._id.toString(),
        studentId: student._id.toString(),
      },
    });

    const populatedApplication = await populateApplicationDetail(
      Application.findById(application._id)
    );

    return res.status(201).json({
      success: true,
      message: 'Ứng tuyển thành công! 🎉',
      application: populatedApplication,
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

// GET MY APPLICATIONS
exports.getMyApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, limit, sort } = req.query;

    const filter = { student: userId };

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'withdrawn' };
    }

    const limitNum = Math.min(parseInt(limit || '0', 10) || 0, 50);
    const sortObj = buildSort(sort);

    let query = Application.find(filter)
      .populate({
        path: 'job',
        select: 'title location salary jobType level status deadline employer',
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

// GET APPLICATIONS OF A JOB
exports.getJobApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { jobId } = req.params;
    const { status, limit, sort } = req.query;

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
    if (status) filter.status = status;

    const limitNum = Math.min(parseInt(limit || '0', 10) || 0, 50);
    const sortObj = buildSort(sort);

    let query = Application.find(filter)
      .populate('student', 'fullName email phone university major gpa skills resumeUrl avatar')
      .sort(sortObj);

    if (limitNum > 0) query = query.limit(limitNum);

    let applications = await query;
    applications = await removeBrokenApplications(applications);

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

// GET ALL APPLICATIONS OF EMPLOYER
exports.getEmployerApplications = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status, limit, sort } = req.query;

    const filter = buildEmployerFilter(userId, status);
    const limitNum = Math.min(parseInt(limit || '0', 10) || 0, 50);
    const sortObj = buildSort(sort);

    let query = Application.find(filter)
      .populate('student', 'fullName email phone university major gpa skills resumeUrl avatar')
      .populate('job', 'title location jobType level status deadline')
      .sort(sortObj);

    if (limitNum > 0) query = query.limit(limitNum);

    let applications = await query;
    applications = await removeBrokenApplications(applications);

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

// GET APPLICATION DETAIL
exports.getApplicationDetail = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { applicationId } = req.params;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

    const application = await populateApplicationDetail(Application.findById(applicationId));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (!application.student || !application.job) {
      await Application.findByIdAndDelete(applicationId);

      return res.status(404).json({
        success: false,
        message: 'Đơn ứng tuyển này không còn hợp lệ vì dữ liệu ứng viên hoặc công việc đã bị xoá',
      });
    }

    if (role === 'student' && application.student._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn này',
      });
    }

    if (role === 'employer' && application.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem đơn này',
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('❌ Get application detail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// UPDATE APPLICATION STATUS
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

    const validStatuses = [
      'reviewing',
      'shortlisted',
      'interviewing',
      'offered',
      'hired',
      'rejected',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ',
      });
    }

    const application = await populateApplicationDetail(Application.findById(applicationId));

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

    if (!canEmployerTransition(application.status, status)) {
      return res.status(400).json({
        success: false,
        message: `Không thể chuyển từ "${application.status}" sang "${status}"`,
      });
    }

    application.status = status;

    if (typeof employerNote === 'string') {
      application.employerNote = employerNote.trim();
    }

    if (status === 'interviewing' && application.interview?.status === 'none') {
      application.interview.status = 'scheduled';
    }

    application.reviewedAt = new Date();
    await application.save();

    const statusTextMap = {
      reviewing: 'đang được xem xét',
      shortlisted: 'đã qua vòng lọc hồ sơ',
      interviewing: 'đã vào vòng phỏng vấn',
      offered: 'đã nhận offer',
      hired: 'đã được tuyển',
      rejected: 'đã bị từ chối',
    };

    await createNotification({
      recipientId: application.student._id,
      recipientRole: 'student',
      recipientModel: 'Student',
      title: 'Cập nhật trạng thái ứng tuyển',
      message: `Đơn ứng tuyển cho vị trí "${application.job?.title}" ${statusTextMap[status] || 'đã được cập nhật'}.`,
      type: 'application_status',
      link: '/student/applications',
      metadata: {
        applicationId: application._id.toString(),
        jobId: application.job?._id?.toString?.() || '',
        status,
      },
    });

    const updatedApplication = await populateApplicationDetail(
      Application.findById(application._id)
    );

    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật trạng thái ứng viên',
      application: updatedApplication,
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

// UPDATE EMPLOYER NOTE
exports.updateEmployerNote = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { employerNote } = req.body;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

    const application = await populateApplicationDetail(Application.findById(applicationId));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật ghi chú cho đơn này',
      });
    }

    if (application.status === 'withdrawn') {
      return res.status(400).json({
        success: false,
        message: 'Không thể lưu ghi chú cho đơn đã rút',
      });
    }

    application.employerNote = typeof employerNote === 'string' ? employerNote.trim() : '';
    await application.save();

    const updatedApplication = await populateApplicationDetail(
      Application.findById(application._id)
    );

    return res.status(200).json({
      success: true,
      message: 'Đã lưu ghi chú',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('❌ Update employer note error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// SCHEDULE INTERVIEW
exports.scheduleInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { scheduledAt, mode, location, meetingLink, note } = req.body;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

    const application = await populateApplicationDetail(Application.findById(applicationId));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền lên lịch phỏng vấn cho đơn này',
      });
    }

    if (application.status === 'withdrawn' || application.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Không thể lên lịch phỏng vấn cho đơn đã rút hoặc đã từ chối',
      });
    }

    if (!scheduledAt) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn thời gian phỏng vấn',
      });
    }

    const interviewDate = new Date(scheduledAt);
    if (Number.isNaN(interviewDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian phỏng vấn không hợp lệ',
      });
    }

    if (interviewDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Thời gian phỏng vấn phải ở tương lai',
      });
    }

    if (!['online', 'offline'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Hình thức phỏng vấn không hợp lệ',
      });
    }

    if (mode === 'online' && !meetingLink?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phỏng vấn online cần có link meeting',
      });
    }

    if (mode === 'offline' && !location?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phỏng vấn offline cần có địa điểm',
      });
    }

    application.interview = {
      scheduledAt: interviewDate,
      mode,
      location: mode === 'offline' ? String(location || '').trim() : '',
      meetingLink: mode === 'online' ? String(meetingLink || '').trim() : '',
      note: String(note || '').trim(),
      status: 'scheduled',
      scheduledBy: userId,
      respondedAt: null,
      cancelledAt: null,
    };

    if (application.status === 'pending') {
      application.status = 'reviewing';
    } else if (application.status === 'reviewing' || application.status === 'shortlisted') {
      application.status = 'interviewing';
    }

    application.reviewedAt = new Date();
    await application.save();

    await createNotification({
      recipientId: application.student._id,
      recipientRole: 'student',
      recipientModel: 'Student',
      title: 'Bạn có lịch phỏng vấn mới',
      message: `Nhà tuyển dụng đã lên lịch phỏng vấn cho vị trí "${application.job?.title}" vào ${interviewDate.toLocaleString('vi-VN')}.`,
      type: 'application_status',
      link: '/student/applications',
      metadata: {
        applicationId: application._id.toString(),
        jobId: application.job?._id?.toString?.() || '',
        interviewStatus: 'scheduled',
      },
    });

    const updatedApplication = await populateApplicationDetail(
      Application.findById(application._id)
    );

    return res.status(200).json({
      success: true,
      message: 'Đã lên lịch phỏng vấn thành công',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('❌ Schedule interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lên lịch phỏng vấn',
      error: error.message,
    });
  }
};

// RESPOND TO INTERVIEW
exports.respondToInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { action } = req.body;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

    if (!['accepted', 'declined'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Phản hồi không hợp lệ',
      });
    }

    const application = await populateApplicationDetail(Application.findById(applicationId));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.student._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền phản hồi lịch phỏng vấn này',
      });
    }

    if (!application.interview || application.interview.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Hiện không có lịch phỏng vấn chờ phản hồi',
      });
    }

    application.interview.status = action;
    application.interview.respondedAt = new Date();

    if (action === 'accepted' && application.status === 'shortlisted') {
      application.status = 'interviewing';
    }

    await application.save();

    await createNotification({
      recipientId: application.employer,
      recipientRole: 'employer',
      recipientModel: 'Employer',
      title:
        action === 'accepted'
          ? 'Ứng viên đã xác nhận lịch phỏng vấn'
          : 'Ứng viên đã từ chối lịch phỏng vấn',
      message:
        action === 'accepted'
          ? `${application.student?.fullName} đã xác nhận lịch phỏng vấn cho vị trí "${application.job?.title}".`
          : `${application.student?.fullName} đã từ chối lịch phỏng vấn cho vị trí "${application.job?.title}".`,
      type: 'application_status',
      link: `/employer/applications/${application.job?._id?.toString?.() || ''}`,
      metadata: {
        applicationId: application._id.toString(),
        interviewStatus: action,
      },
    });

    const updatedApplication = await populateApplicationDetail(
      Application.findById(application._id)
    );

    return res.status(200).json({
      success: true,
      message:
        action === 'accepted'
          ? 'Bạn đã xác nhận lịch phỏng vấn'
          : 'Bạn đã từ chối lịch phỏng vấn',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('❌ Respond to interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể phản hồi lịch phỏng vấn',
      error: error.message,
    });
  }
};

// CANCEL INTERVIEW
exports.cancelInterview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { applicationId } = req.params;

    if (!isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'ApplicationId không hợp lệ',
      });
    }

    const application = await populateApplicationDetail(Application.findById(applicationId));

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy lịch phỏng vấn của đơn này',
      });
    }

    if (!application.interview || application.interview.status === 'none') {
      return res.status(400).json({
        success: false,
        message: 'Đơn này chưa có lịch phỏng vấn',
      });
    }

    if (application.interview.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Lịch phỏng vấn này đã bị hủy trước đó',
      });
    }

    application.interview.status = 'cancelled';
    application.interview.cancelledAt = new Date();
    await application.save();

    await createNotification({
      recipientId: application.student._id,
      recipientRole: 'student',
      recipientModel: 'Student',
      title: 'Lịch phỏng vấn đã bị hủy',
      message: `Nhà tuyển dụng đã hủy lịch phỏng vấn cho vị trí "${application.job?.title}".`,
      type: 'application_status',
      link: '/student/applications',
      metadata: {
        applicationId: application._id.toString(),
        interviewStatus: 'cancelled',
      },
    });

    const updatedApplication = await populateApplicationDetail(
      Application.findById(application._id)
    );

    return res.status(200).json({
      success: true,
      message: 'Đã hủy lịch phỏng vấn',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('❌ Cancel interview error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể hủy lịch phỏng vấn',
      error: error.message,
    });
  }
};

// WITHDRAW APPLICATION
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

    if (!STUDENT_WITHDRAW_ALLOWED.includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể rút đơn khi đang chờ xử lý, đang xem xét hoặc đã shortlist',
      });
    }

    application.status = 'withdrawn';
    await application.save();

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
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// STUDENT STATS
exports.getMyApplicationStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const total = await Application.countDocuments({
      student: userId,
      status: { $ne: 'withdrawn' },
    });

    const pending = await Application.countDocuments({ student: userId, status: 'pending' });
    const reviewing = await Application.countDocuments({ student: userId, status: 'reviewing' });
    const shortlisted = await Application.countDocuments({ student: userId, status: 'shortlisted' });
    const interviewing = await Application.countDocuments({ student: userId, status: 'interviewing' });
    const offered = await Application.countDocuments({ student: userId, status: 'offered' });
    const hired = await Application.countDocuments({ student: userId, status: 'hired' });
    const accepted = offered + hired;
    const rejected = await Application.countDocuments({ student: userId, status: 'rejected' });
    const withdrawn = await Application.countDocuments({ student: userId, status: 'withdrawn' });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        reviewing,
        shortlisted,
        interviewing,
        offered,
        hired,
        accepted,
        rejected,
        withdrawn,
      },
      statistics: {
        total,
        pending,
        reviewing,
        shortlisted,
        interviewing,
        offered,
        hired,
        accepted,
        rejected,
        withdrawn,
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

// EMPLOYER STATS
exports.getEmployerApplicationStats = async (req, res) => {
  try {
    const { userId } = req.user;

    const total = await Application.countDocuments({
      employer: userId,
      status: { $ne: 'withdrawn' },
    });

    const pending = await Application.countDocuments({ employer: userId, status: 'pending' });
    const reviewing = await Application.countDocuments({ employer: userId, status: 'reviewing' });
    const shortlisted = await Application.countDocuments({ employer: userId, status: 'shortlisted' });
    const interviewing = await Application.countDocuments({ employer: userId, status: 'interviewing' });
    const offered = await Application.countDocuments({ employer: userId, status: 'offered' });
    const hired = await Application.countDocuments({ employer: userId, status: 'hired' });
    const rejected = await Application.countDocuments({ employer: userId, status: 'rejected' });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        reviewing,
        shortlisted,
        interviewing,
        offered,
        hired,
        rejected,
      },
    });
  } catch (error) {
    console.error('❌ Get employer application stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// CHECK IF APPLIED
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