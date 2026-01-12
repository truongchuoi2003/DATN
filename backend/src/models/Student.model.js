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

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    // Thông tin sinh viên
    studentId: {
      type: String,
      trim: true,
    },

    major: {
      type: String, // Ngành học
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

    skills: [
      {
        type: String,
      },
    ],

    cv: {
      type: String, // URL của CV
    },

    avatar: {
      type: String, // URL của avatar
    },

    bio: {
      type: String,
      maxlength: 500,
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

// 🔐 Hash password trước khi lưu
studentSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔍 So sánh password khi đăng nhập
studentSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);