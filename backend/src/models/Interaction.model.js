const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },

    interactionType: {
      type: String,
      required: true,
      enum: ['view', 'click', 'save', 'apply', 'unsave'],
      index: true,
    },

    interactionValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    source: {
      type: String,
      enum: ['web', 'recommendation', 'search', 'manual'],
      default: 'web',
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

// Tự động gán điểm nếu chưa truyền interactionValue
interactionSchema.pre('validate', function () {
  if (!this.interactionValue || this.interactionValue <= 0) {
    const scoreMap = {
      view: 1,
      click: 2,
      save: 3,
      apply: 5,
      unsave: 1,
    };

    this.interactionValue = scoreMap[this.interactionType] || 1;
  }
});

// Index để query nhanh cho recommend system
interactionSchema.index({ student: 1, job: 1, createdAt: -1 });
interactionSchema.index({ student: 1, interactionType: 1, createdAt: -1 });
interactionSchema.index({ job: 1, interactionType: 1, createdAt: -1 });

module.exports = mongoose.model('Interaction', interactionSchema);