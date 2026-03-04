const Job = require('../models/Job.model');
const Employer = require('../models/Employer.model');
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

// 👁️ RECORD VIEW (Student)
exports.recordJobView = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { jobId } = req.params;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể ghi nhận lịch sử xem việc làm',
      });
    }

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

    const job = await Job.findById(jobId).select('_id status');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    await createInteractionLog({
      studentId: userId,
      jobId,
      interactionType: 'view',
      source: 'web',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã ghi nhận lượt xem',
    });
  } catch (error) {
    console.error('❌ Record job view error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 🖱️ RECORD CLICK (Student)
exports.recordJobClick = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { jobId } = req.params;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể ghi nhận click việc làm',
      });
    }

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

    const job = await Job.findById(jobId).select('_id status');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    await createInteractionLog({
      studentId: userId,
      jobId,
      interactionType: 'click',
      source: 'web',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã ghi nhận click',
    });
  } catch (error) {
    console.error('❌ Record job click error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ⭐ SAVE JOB (Student)
exports.saveJob = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { jobId } = req.params;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể lưu việc làm',
      });
    }

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

    const job = await Job.findById(jobId).select('_id status title');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    const latestSaveState = await Interaction.findOne({
      student: userId,
      job: jobId,
      interactionType: { $in: ['save', 'unsave'] },
    }).sort({ createdAt: -1 });

    if (latestSaveState && latestSaveState.interactionType === 'save') {
      return res.status(200).json({
        success: true,
        message: 'Tin tuyển dụng này đã được lưu trước đó',
      });
    }

    await createInteractionLog({
      studentId: userId,
      jobId,
      interactionType: 'save',
      source: 'manual',
    });

    return res.status(201).json({
      success: true,
      message: 'Đã lưu việc làm thành công',
    });
  } catch (error) {
    console.error('❌ Save job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ❌ UNSAVE JOB (Student)
exports.unsaveJob = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { jobId } = req.params;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể bỏ lưu việc làm',
      });
    }

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'JobId không hợp lệ',
      });
    }

    const job = await Job.findById(jobId).select('_id');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng',
      });
    }

    const latestSaveState = await Interaction.findOne({
      student: userId,
      job: jobId,
      interactionType: { $in: ['save', 'unsave'] },
    }).sort({ createdAt: -1 });

    if (!latestSaveState || latestSaveState.interactionType !== 'save') {
      return res.status(200).json({
        success: true,
        message: 'Tin tuyển dụng này hiện chưa ở trạng thái đã lưu',
      });
    }

    await createInteractionLog({
      studentId: userId,
      jobId,
      interactionType: 'unsave',
      source: 'manual',
    });

    return res.status(200).json({
      success: true,
      message: 'Đã bỏ lưu việc làm',
    });
  } catch (error) {
    console.error('❌ Unsave job error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// 📌 GET MY SAVED JOBS (Student)
exports.getMySavedJobs = async (req, res) => {
  try {
    const { userId, role } = req.user;

    if (role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ sinh viên mới có thể xem danh sách đã lưu',
      });
    }

    const latestStates = await Interaction.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(userId),
          interactionType: { $in: ['save', 'unsave'] },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$job',
          latestType: { $first: '$interactionType' },
          latestAt: { $first: '$createdAt' },
        },
      },
      {
        $match: {
          latestType: 'save',
        },
      },
      { $sort: { latestAt: -1 } },
    ]);

    const jobIds = latestStates.map((item) => item._id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        jobs: [],
      });
    }

    const jobs = await Job.find({
      _id: { $in: jobIds },
      status: 'active',
    })
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 });

    const jobMap = new Map(jobs.map((job) => [job._id.toString(), job]));
    const orderedJobs = jobIds
      .map((id) => jobMap.get(id.toString()))
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: orderedJobs.length,
      jobs: orderedJobs,
    });
  } catch (error) {
    console.error('❌ Get my saved jobs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

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
      lat,
      lng,
      radiusKm,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

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
      const minSalaryValue = parseInt(minSalary, 10);
      if (!Number.isNaN(minSalaryValue)) {
        filter['salary.min'] = { $gte: minSalaryValue };
      }
    }

    if (maxSalary) {
      const maxSalaryValue = parseInt(maxSalary, 10);
      if (!Number.isNaN(maxSalaryValue)) {
        filter['salary.max'] = { $lte: maxSalaryValue };
      }
    }

    // Filter by skills
    if (skills) {
      const skillArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      if (skillArray.length > 0) {
        filter.skills = { $in: skillArray };
      }
    }

    // ✅ Lọc thật sự theo bán kính (backend geospatial filter)
    const hasAnyGeoParam = lat !== undefined || lng !== undefined || radiusKm !== undefined;

    if (hasAnyGeoParam) {
      const latValue = parseFloat(lat);
      const lngValue = parseFloat(lng);
      const radiusValue = parseFloat(radiusKm);

      const isValidGeoInput =
        Number.isFinite(latValue) &&
        Number.isFinite(lngValue) &&
        Number.isFinite(radiusValue) &&
        radiusValue > 0;

      if (!isValidGeoInput) {
        return res.status(400).json({
          success: false,
          message: 'lat, lng, radiusKm không hợp lệ',
        });
      }

      const earthRadiusKm = 6371;

      filter['location.coordinates'] = {
        $geoWithin: {
          $centerSphere: [[lngValue, latValue], radiusValue / earthRadiusKm],
        },
      };
    }

    const skip = (currentPage - 1) * pageSize;

    const jobs = await Job.find(filter)
      .populate('employer', 'companyName logo website')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: jobs.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
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