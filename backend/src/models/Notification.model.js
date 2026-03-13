const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientModel',
    },

    recipientModel: {
      type: String,
      required: true,
      enum: ['Student', 'Employer', 'Admin'],
    },

    recipientRole: {
      type: String,
      required: true,
      enum: ['student', 'employer', 'admin'],
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    type: {
      type: String,
      default: 'system',
      enum: [
        'system',
        'application',
        'application_status',
        'verification',
        'report',
      ],
    },

    link: {
      type: String,
      default: '',
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, recipientRole: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, recipientRole: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);