const mongoose = require('mongoose');
const Report = require('../models/Report.model');
const Application = require('../models/Application.model');
const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Job = require('../models/Job.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.employerReportCandidate = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      applicationId,
      reason,
      description,
      evidenceUrls = [],
    } = req.body;

    if (!applicationId || !isValidObjectId(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Application không hợp lệ',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn lý do report',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mô tả chi tiết',
      });
    }

    const application = await Application.findById(applicationId)
      .populate('student', 'fullName email')
      .populate('job', 'title employer');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn ứng tuyển',
      });
    }

    if (application.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền report ứng viên này',
      });
    }

    const student = await Student.findById(application.student._id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ứng viên',
      });
    }

    const existingOpenReport = await Report.findOne({
      reporterRole: 'employer',
      reporterId: userId,
      targetType: 'student',
      targetId: student._id,
      relatedApplication: application._id,
      status: { $in: ['open', 'in_review'] },
    });

    if (existingOpenReport) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã report ứng viên này cho đơn ứng tuyển này rồi',
      });
    }

    const cleanEvidenceUrls = Array.isArray(evidenceUrls)
      ? evidenceUrls
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const report = await Report.create({
      reporterRole: 'employer',
      reporterId: userId,
      reporterModel: 'Employer',

      targetType: 'student',
      targetId: student._id,
      targetModel: 'Student',

      relatedJob: application.job?._id || application.job,
      relatedApplication: application._id,

      reason,
      description: description.trim(),
      evidenceUrls: cleanEvidenceUrls,
      status: 'open',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã gửi report ứng viên thành công',
      report,
    });
  } catch (error) {
    console.error('❌ Employer report candidate error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi report ứng viên',
      error: error.message,
    });
  }
};
exports.studentReportJob = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      jobId,
      reason,
      description,
      evidenceUrls = [],
    } = req.body;

    if (!jobId || !isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Job không hợp lệ',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn lý do report',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mô tả chi tiết',
      });
    }

    const job = await Job.findById(jobId).populate('employer', 'companyName email');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài đăng',
      });
    }

    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
      });
    }

    const existingOpenReport = await Report.findOne({
      reporterRole: 'student',
      reporterId: userId,
      targetType: 'job',
      targetId: job._id,
      status: { $in: ['open', 'in_review'] },
    });

    if (existingOpenReport) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã report bài đăng này rồi',
      });
    }

    const cleanEvidenceUrls = Array.isArray(evidenceUrls)
      ? evidenceUrls
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const report = await Report.create({
      reporterRole: 'student',
      reporterId: userId,
      reporterModel: 'Student',

      targetType: 'job',
      targetId: job._id,
      targetModel: 'Job',

      relatedJob: job._id,
      relatedApplication: null,

      reason,
      description: description.trim(),
      evidenceUrls: cleanEvidenceUrls,
      status: 'open',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã gửi report bài đăng thành công',
      report,
    });
  } catch (error) {
    console.error('❌ Student report job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi report bài đăng',
      error: error.message,
    });
  }
};
exports.studentReportEmployer = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      employerId,
      jobId = null,
      reason,
      description,
      evidenceUrls = [],
    } = req.body;

    if (!employerId || !isValidObjectId(employerId)) {
      return res.status(400).json({
        success: false,
        message: 'Employer không hợp lệ',
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn lý do report',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập mô tả chi tiết',
      });
    }

    const student = await Student.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sinh viên',
      });
    }

    const employer = await Employer.findById(employerId);
    if (!employer) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà tuyển dụng',
      });
    }

    let relatedJob = null;
    if (jobId) {
      if (!isValidObjectId(jobId)) {
        return res.status(400).json({
          success: false,
          message: 'Job không hợp lệ',
        });
      }

      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài đăng liên quan',
        });
      }

      relatedJob = job._id;
    }

    const existingOpenReport = await Report.findOne({
      reporterRole: 'student',
      reporterId: userId,
      targetType: 'employer',
      targetId: employer._id,
      relatedJob: relatedJob,
      status: { $in: ['open', 'in_review'] },
    });

    if (existingOpenReport) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã report nhà tuyển dụng này rồi',
      });
    }

    const cleanEvidenceUrls = Array.isArray(evidenceUrls)
      ? evidenceUrls
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .slice(0, 5)
      : [];

    const report = await Report.create({
      reporterRole: 'student',
      reporterId: userId,
      reporterModel: 'Student',

      targetType: 'employer',
      targetId: employer._id,
      targetModel: 'Employer',

      relatedJob,
      relatedApplication: null,

      reason,
      description: description.trim(),
      evidenceUrls: cleanEvidenceUrls,
      status: 'open',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã gửi report nhà tuyển dụng thành công',
      report,
    });
  } catch (error) {
    console.error('❌ Student report employer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi report nhà tuyển dụng',
      error: error.message,
    });
  }
};