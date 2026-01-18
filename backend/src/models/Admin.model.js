const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema(
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

    avatar: {
      type: String, // URL của avatar
    },

    permissions: {
      type: [String],
      default: ['all'], // Quyền: all, manage_users, manage_jobs, etc.
    },

    role: {
      type: String,
      default: 'admin',
      enum: ['admin'],
    },

    lastLogin: {
      type: Date,
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
adminSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔍 So sánh password khi đăng nhập
adminSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);