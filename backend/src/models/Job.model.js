const mongoose = require('mongoose');

const normalizeStringArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr.map((x) => String(x || '').trim()).filter(Boolean))];
};

const jobSchema = new mongoose.Schema(
  {
    // 👤 Thông tin nhà tuyển dụng
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },

    // 📋 Thông tin công việc
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },

    requirements: {
      type: String,
      required: true,
      maxlength: 3000,
    },

    benefits: {
      type: String,
      maxlength: 2000,
    },

    // ✅ NEW: Ngành học phù hợp (để match với student.major)
    acceptableMajors: [
      {
        type: String,
        trim: true,
      },
    ],

    // ✅ NEW: Hình thức làm việc
    workMode: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite',
    },

    // 📍 Địa điểm
    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      // Tọa độ cho map (optional)
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
      },
    },

    // 💰 Lương
    salary: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'VND',
        enum: ['VND', 'USD'],
      },
      negotiable: {
        type: Boolean,
        default: false,
      },
    },

    // 🏢 Loại công việc
    jobType: {
      type: String,
      required: true,
      enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
    },

    level: {
      type: String,
      required: true,
      enum: ['intern', 'fresher', 'junior', 'middle', 'senior', 'leader', 'manager'],
    },

    experience: {
      type: String,
      required: true,
      enum: ['no-experience', '0-1-year', '1-3-years', '3-5-years', '5+-years'],
    },

    // 🔧 Kỹ năng (field cũ - đang dùng trong UI/filters)
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // ✅ NEW: Tách required/preferred để scoring tốt hơn
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredSkills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Nhóm ngành nghề (Backend/Frontend/DA/Tester…)
    categories: [
      {
        type: String,
        trim: true,
      },
    ],

    // ⏰ Thời hạn
    deadline: {
      type: Date,
      required: true,
    },

    slots: {
      type: Number,
      default: 1,
      min: 1,
    },

    // 📊 Trạng thái
    status: {
      type: String,
      default: 'active',
      enum: ['active', 'closed', 'expired'],
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    // 📈 Thống kê
    views: {
      type: Number,
      default: 0,
    },

    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Đồng bộ dữ liệu để không phá code cũ:
// - Nếu UI chỉ gửi "skills", ta tự map sang "requiredSkills"
// - Nếu sau này bạn chỉ dùng requiredSkills, vẫn giữ "skills" cho filter/search cũ
jobSchema.pre('validate', function () {
  this.skills = normalizeStringArray(this.skills);
  this.requiredSkills = normalizeStringArray(this.requiredSkills);
  this.preferredSkills = normalizeStringArray(this.preferredSkills);
  this.categories = normalizeStringArray(this.categories);
  this.acceptableMajors = normalizeStringArray(this.acceptableMajors);

  // Nếu requiredSkills trống mà skills có => coi skills là requiredSkills
  if ((!this.requiredSkills || this.requiredSkills.length === 0) && this.skills.length > 0) {
    this.requiredSkills = [...this.skills];
  }

  // Nếu skills trống mà requiredSkills có => đổ ngược để filter cũ vẫn chạy
  if ((!this.skills || this.skills.length === 0) && this.requiredSkills.length > 0) {
    this.skills = [...this.requiredSkills];
  }
});

// Index để search nhanh
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text', requirements: 'text' });
jobSchema.index({ 'location.city': 1, jobType: 1 });
jobSchema.index({ categories: 1 });
jobSchema.index({ acceptableMajors: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ requiredSkills: 1 });

module.exports = mongoose.model('Job', jobSchema);