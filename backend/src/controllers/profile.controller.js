const fs = require('fs');
const path = require('path');
const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Admin = require('../models/Admin.model');

const getUploadedFile = (req, fieldName) => {
  if (!req?.files) return null;
  const files = req.files[fieldName];
  return Array.isArray(files) && files.length > 0 ? files[0] : null;
};

const removeOldUploadedFile = (fileUrl) => {
  try {
    if (!fileUrl || typeof fileUrl !== 'string') return;
    if (!fileUrl.startsWith('/uploads/')) return;

    const filePath = path.join(__dirname, '../../', fileUrl.replace(/^\/+/, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('⚠️ Không thể xoá file cũ:', error.message);
  }
};

const normalizeStringArray = (value, allowedValues = null) => {
  let arr = value;

  if (typeof arr === 'string') {
    arr = arr
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(arr)) return [];

  let normalized = [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];

  if (Array.isArray(allowedValues) && allowedValues.length > 0) {
    normalized = normalized.filter((x) => allowedValues.includes(x));
  }

  return normalized;
};

// 👤 GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let Model;

    if (role === 'student') {
      Model = Student;
    } else if (role === 'employer') {
      Model = Employer;
    } else if (role === 'admin') {
      Model = Admin;
    }

    const user = await Model.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// ✏️ UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const updateData = { ...req.body };

    console.log('📝 Update profile request:', {
      userId,
      role,
      files: Object.keys(req.files || {}),
      bodyKeys: Object.keys(updateData || {}),
    });

    delete updateData.password;
    delete updateData.email;
    delete updateData.role;

    let Model;
    if (role === 'student') {
      Model = Student;
    } else if (role === 'employer') {
      Model = Employer;
    } else if (role === 'admin') {
      Model = Admin;
    }

    const existingUser = await Model.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const resumeFile = getUploadedFile(req, 'resume');
    const avatarFile = getUploadedFile(req, 'avatar');
    const logoFile = getUploadedFile(req, 'logo');

    // ✅ Xử lý upload theo role
    if (role === 'student') {
      if (resumeFile) {
        removeOldUploadedFile(existingUser.resumeUrl);
        updateData.resumeUrl = `/uploads/${resumeFile.filename}`;
      }

      if (avatarFile) {
        removeOldUploadedFile(existingUser.avatar);
        updateData.avatar = `/uploads/${avatarFile.filename}`;
      }
    }

    if (role === 'employer' && logoFile) {
      removeOldUploadedFile(existingUser.logo);
      updateData.logo = `/uploads/${logoFile.filename}`;
    }

    // ✅ Chuẩn hóa mảng cho student
    if (role === 'student') {
      const allowedJobTypes = ['full-time', 'part-time', 'internship', 'contract', 'freelance'];
      const allowedWorkModes = ['onsite', 'remote', 'hybrid'];

      if (updateData.skills !== undefined) {
        updateData.skills = normalizeStringArray(updateData.skills);
      }

      if (updateData.preferredCategories !== undefined) {
        updateData.preferredCategories = normalizeStringArray(updateData.preferredCategories);
      }

      if (updateData.desiredJobTitles !== undefined) {
        updateData.desiredJobTitles = normalizeStringArray(updateData.desiredJobTitles);
      }

      if (updateData.preferredLocations !== undefined) {
        updateData.preferredLocations = normalizeStringArray(updateData.preferredLocations);
      }

      if (updateData.projects !== undefined) {
        updateData.projects = normalizeStringArray(updateData.projects);
      }

      if (updateData.projectTechnologies !== undefined) {
        updateData.projectTechnologies = normalizeStringArray(updateData.projectTechnologies);
      }

      if (updateData.certifications !== undefined) {
        updateData.certifications = normalizeStringArray(updateData.certifications);
      }

      if (updateData.preferredJobTypes !== undefined) {
        updateData.preferredJobTypes = normalizeStringArray(
          updateData.preferredJobTypes,
          allowedJobTypes
        );
      }

      if (updateData.preferredWorkModes !== undefined) {
        updateData.preferredWorkModes = normalizeStringArray(
          updateData.preferredWorkModes,
          allowedWorkModes
        );
      }

      if (updateData.graduationYear !== undefined && updateData.graduationYear !== '') {
        updateData.graduationYear = Number(updateData.graduationYear);
      }

      if (updateData.gpa !== undefined && updateData.gpa !== '') {
        updateData.gpa = Number(updateData.gpa);
      }
    }

    const user = await Model.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    console.log('✅ Profile updated successfully');

    res.status(200).json({
      success: true,
      message: avatarFile
        ? 'Tải ảnh đại diện thành công'
        : resumeFile
        ? 'Tải CV thành công'
        : logoFile
        ? 'Tải logo thành công'
        : 'Cập nhật profile thành công',
      profile: user,
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật profile',
      error: error.message,
    });
  }
};

// 🔒 CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
    }

    let Model;
    if (role === 'student') {
      Model = Student;
    } else if (role === 'employer') {
      Model = Employer;
    } else if (role === 'admin') {
      Model = Admin;
    }

    const user = await Model.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};