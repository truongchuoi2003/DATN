const Job = require('../models/Job.model');
const Employer = require('../models/Employer.model');
const mongoose = require('mongoose'); // ✅ THÊM DÒNG NÀY

// 📋 CREATE JOB (Employer only)
exports.createJob = async (req, res) => {
  try {
    const { userId, role } = req.user;

    // Kiểm tra role
    if (role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ nhà tuyển dụng mới có thể đăng tin',
      });
    }

    // Kiểm tra employer đã verified chưa
    const employer = await Employer.findById(userId);
    if (!employer || !employer.verified) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được xác thực. Vui lòng chờ admin duyệt.',
      });
    }

    // Tạo job mới
    const jobData = {
      ...req.body,
      employer: userId,
    };

    const job = new Job(jobData);
    await job.save();

    // Populate employer info
    await job.populate('employer', 'companyName email logo');

    res.status(201).json({
      success: true,
      message: 'Đăng tin thành công!',
      job,
    });
  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET ALL JOBS (của employer hiện tại)
exports.getMyJobs = async (req, res) => {
  try {
    const { userId } = req.user;
    const { status } = req.query; // ?status=active

    const filter = { employer: userId };
    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .populate('employer', 'companyName email logo');

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('❌ Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET JOB BY ID
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.user;

    console.log('🔍 Fetching job:', jobId, 'for user:', userId); // Debug log

    const job = await Job.findById(jobId).populate('employer', 'companyName email logo website');

    if (!job) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    console.log('✅ Job found, employer:', job.employer._id.toString()); // Debug log

    // Kiểm tra quyền truy cập
    if (job.employer._id.toString() !== userId) {
      console.log('❌ Access denied. Job owner:', job.employer._id, 'User:', userId);
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem tin này',
      });
    }

    console.log('✅ Sending job data'); // Debug log

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('❌ Get job by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ✏️ UPDATE JOB
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.user;
    const updateData = req.body;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    // Kiểm tra quyền sở hữu
    if (job.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa tin này',
      });
    }

    // Không cho phép sửa một số field
    delete updateData.employer;
    delete updateData.views;
    delete updateData.applicationsCount;

    // Cập nhật
    Object.assign(job, updateData);
    await job.save();

    await job.populate('employer', 'companyName email logo');

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      job,
    });
  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ❌ DELETE JOB
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.user;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    // Kiểm tra quyền sở hữu
    if (job.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa tin này',
      });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: 'Đã xóa tin tuyển dụng',
    });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 🔒 CLOSE/OPEN JOB
exports.toggleJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.user;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    // Kiểm tra quyền sở hữu
    if (job.employer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thay đổi trạng thái tin này',
      });
    }

    // Toggle status
    job.status = job.status === 'active' ? 'closed' : 'active';
    await job.save();

    res.status(200).json({
      success: true,
      message: `Đã ${job.status === 'active' ? 'mở lại' : 'đóng'} tin tuyển dụng`,
      job,
    });
  } catch (error) {
    console.error('❌ Toggle job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📊 GET STATISTICS
exports.getJobStatistics = async (req, res) => {
  try {
    const { userId } = req.user;

    const totalJobs = await Job.countDocuments({ employer: userId });
    const activeJobs = await Job.countDocuments({ employer: userId, status: 'active' });
    const closedJobs = await Job.countDocuments({ employer: userId, status: 'closed' });
    
    // Tổng views và applications
    const stats = await Job.aggregate([
      { 
        $match: { 
          employer: new mongoose.Types.ObjectId(userId) // ✅ SỬA
        } 
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalApplications: { $sum: '$applicationsCount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalJobs,
        activeJobs,
        closedJobs,
        totalViews: stats[0]?.totalViews || 0,
        totalApplications: stats[0]?.totalApplications || 0,
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

// 📋 GET ALL PUBLIC JOBS (Không cần login)
exports.getAllPublicJobs = async (req, res) => {
  try {
    const { 
      search, 
      city, 
      jobType, 
      level, 
      minSalary, 
      maxSalary,
      skills,
      page = 1,
      limit = 10 
    } = req.query;

    const filter = { status: 'active' };

    // Search by title or description
    if (search) {
      filter.$text = { $search: search };
    }

    // Filter by location
    if (city) {
      filter['location.city'] = city;
    }

    // Filter by job type
    if (jobType) {
      filter.jobType = jobType;
    }

    // Filter by level
    if (level) {
      filter.level = level;
    }

    // Filter by salary
    if (minSalary) {
      filter['salary.min'] = { $gte: parseInt(minSalary) };
    }
    if (maxSalary) {
      filter['salary.max'] = { $lte: parseInt(maxSalary) };
    }

    // Filter by skills
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArray };
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      jobs,
    });
  } catch (error) {
    console.error('❌ Get public jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📋 GET PUBLIC JOB DETAIL (Không cần login)
exports.getPublicJobDetail = async (req, res) => {
  try {
    const { jobId } = req.params;

    // ✅ Chặn sớm nếu jobId không phải ObjectId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

    const job = await Job.findById(jobId)
      .populate('employer', 'companyName logo website description industry companySize');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    // Tăng views
    job.views += 1;
    await job.save();

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    console.error('❌ Get public job detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};