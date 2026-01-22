const mongoose = require('mongoose');

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

    // 🔧 Kỹ năng
    skills: [String],

    categories: [String],

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

// Index để search nhanh
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ city: 1, jobType: 1 });

module.exports = mongoose.model('Job', jobSchema);