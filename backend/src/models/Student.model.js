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

    // 🎓 CHỈ STUDENT CÓ
    birthday: {
      type: Date,
    },

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
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

    graduationYear: {
      type: Number,
    },

    gpa: {
      type: Number,
      min: 0,
      max: 4,
    },

    skills: [String],

    resumeUrl: {
      type: String, // URL CV
    },

    avatar: {
      type: String,
    },

    bio: {
      type: String,
      maxlength: 500,
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
