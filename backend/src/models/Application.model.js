const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // 📋 Thông tin cơ bản
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: true,
    },

    // 📝 Thông tin ứng tuyển
    coverLetter: {
      type: String,
      maxlength: 2000,
    },

    resumeUrl: {
      type: String, // URL CV
    },

    // ✅ THÊM MỚI
    expectedSalary: {
      type: Number,
      min: 0,
    },

    availableFrom: {
      type: Date,
    },

    additionalInfo: {
      type: String,
      maxlength: 500,
    },
    // KẾT THÚC THÊM MỚI

    // 📊 Trạng thái
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'reviewing', 'accepted', 'rejected', 'withdrawn'],
    },

    // 💬 Phản hồi từ employer
    employerNote: {
      type: String,
      maxlength: 1000,
    },

    reviewedAt: {
      type: Date,
    },

    // ⏰ Thời gian
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index để query nhanh
applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);