const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema(
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
      required: true,
    },

    address: {
      type: String,
    },

    // Thông tin công ty
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    },

    industry: {
      type: String, // Lĩnh vực: IT, Marketing, Finance...
      trim: true,
    },

    website: {
      type: String,
    },

    logo: {
      type: String, // URL của logo công ty
    },

    description: {
      type: String,
      maxlength: 1000,
    },

    taxCode: {
      type: String, // Mã số thuế
      trim: true,
    },

    verified: {
      type: Boolean,
      default: false, // Admin sẽ duyệt công ty
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
employerSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// 🔍 So sánh password khi đăng nhập
employerSchema.methods.comparePassword = async function (inputPassword) {
  return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('Employer', employerSchema);