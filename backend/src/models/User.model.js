const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
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

    role: {
      type: String,
      enum: ['student', 'employer', 'admin'],
      default: 'student',
    },

    phone: {
      type: String,
    },

    address: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // tự tạo createdAt, updatedAt
  }
);

// 🔐 mã hóa password trước khi lưu
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    throw new Error('Password hashing failed: ' + error.message);
  }
});

// 🔍 so sánh password khi đăng nhập
userSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
