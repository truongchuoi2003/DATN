const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterRole: {
      type: String,
      required: true,
      enum: ['student', 'employer'],
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reporterModel',
    },

    reporterModel: {
      type: String,
      required: true,
      enum: ['Student', 'Employer'],
    },

    targetType: {
      type: String,
      required: true,
      enum: ['student', 'employer', 'job'],
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetModel',
    },

    targetModel: {
      type: String,
      required: true,
      enum: ['Student', 'Employer', 'Job'],
    },

    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },

    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        'spam',
        'fake_information',
        'inappropriate_content',
        'fraud',
        'harassment',
        'unprofessional_behavior',
        'other',
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    evidenceUrls: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      default: 'open',
      enum: ['open', 'in_review', 'resolved', 'dismissed'],
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },

    handledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporterRole: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, createdAt: -1 });
reportSchema.index({ targetId: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);