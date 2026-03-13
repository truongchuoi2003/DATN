const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    scheduledAt: {
      type: Date,
      default: null,
    },

    mode: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },

    location: {
      type: String,
      trim: true,
      default: '',
    },

    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },

    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },

    status: {
      type: String,
      enum: ['none', 'scheduled', 'accepted', 'declined', 'cancelled', 'completed'],
      default: 'none',
    },

    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      default: null,
    },

    respondedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
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

    coverLetter: {
      type: String,
      maxlength: 2000,
    },

    resumeUrl: {
      type: String,
    },

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

    status: {
      type: String,
      default: 'pending',
      enum: [
        'pending',
        'reviewing',
        'shortlisted',
        'interviewing',
        'offered',
        'hired',
        'rejected',
        'withdrawn',
      ],
    },

    employerNote: {
      type: String,
      maxlength: 1000,
    },

    interview: {
      type: interviewSchema,
      default: () => ({
        status: 'none',
      }),
    },

    reviewedAt: {
      type: Date,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ 'interview.status': 1 });
applicationSchema.index({ 'interview.scheduledAt': 1 });

module.exports = mongoose.model('Application', applicationSchema);