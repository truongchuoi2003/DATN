const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // 🎓 CHỈ STUDENT CÓ
    birthday: {
      type: Date,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // 🎓 Thông tin sinh viên
    studentId: {
      type: String,
      trim: true,
    },

    major: {
      type: String,
      trim: true,
    },

    university: {
      type: String,
      trim: true,
    },

    // Năm học hiện tại: 1, 2, 3, 4, 5 hoặc graduated
    academicYear: {
      type: String,
      enum: ['1', '2', '3', '4', '5', 'graduated'],
      default: '1',
    },

    graduationYear: {
      type: Number,
    },

    gpa: {
      type: Number,
      min: 0,
      max: 4,
    },

    // Kỹ năng chuyên môn
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    // Nhóm nghề quan tâm: Backend, Frontend, Data Analyst,...
    preferredCategories: [
      {
        type: String,
        trim: true,
      },
    ],

    // Vị trí mong muốn: Frontend Developer Intern, Backend Intern,...
    desiredJobTitles: [
      {
        type: String,
        trim: true,
      },
    ],

    // Nơi mong muốn làm việc
    preferredLocations: [
      {
        type: String,
        trim: true,
      },
    ],

    // Loại hình công việc mong muốn
    preferredJobTypes: [
      {
        type: String,
        enum: ['full-time', 'part-time', 'internship', 'contract', 'freelance'],
      },
    ],

    // Hình thức làm việc mong muốn
    preferredWorkModes: [
      {
        type: String,
        enum: ['onsite', 'remote', 'hybrid'],
      },
    ],

    // Mức lương kỳ vọng
    salaryExpectation: {
      min: {
        type: Number,
        min: 0,
        default: 0,
      },
      max: {
        type: Number,
        min: 0,
        default: 0,
      },
      currency: {
        type: String,
        default: 'VND',
        trim: true,
      },
    },

    // Mức kinh nghiệm tổng quát
    experienceLevel: {
      type: String,
      enum: ['none', 'fresher', 'junior', 'middle', 'senior'],
      default: 'none',
    },

    // Tổng số tháng kinh nghiệm (nếu muốn chấm điểm chi tiết hơn)
    experienceMonths: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Dự án cá nhân / học tập
    projects: [
      {
        type: String,
        trim: true,
      },
    ],

    // Công nghệ đã dùng trong dự án
    projectTechnologies: [
      {
        type: String,
        trim: true,
      },
    ],

    // Ngoại ngữ / chứng chỉ
    languages: [
      {
        name: {
          type: String,
          trim: true,
        },
        level: {
          type: String,
          trim: true,
        },
      },
    ],

    certifications: [
      {
        type: String,
        trim: true,
      },
    ],

    // Link tài liệu / hồ sơ
    resumeUrl: {
      type: String,
      trim: true,
    },

    portfolioUrl: {
      type: String,
      trim: true,
    },

    githubUrl: {
      type: String,
      trim: true,
    },

    linkedinUrl: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
      trim: true,
    },

    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },

    // 📍 dùng cho map + gợi ý việc
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
        default: undefined,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index phục vụ lọc / recommend
studentSchema.index({ major: 1 });
studentSchema.index({ preferredCategories: 1 });
studentSchema.index({ preferredLocations: 1 });
studentSchema.index({ skills: 1 });

// 🔐 Hash password
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔍 So sánh password
studentSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);