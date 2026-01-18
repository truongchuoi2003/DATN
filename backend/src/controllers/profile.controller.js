const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Admin = require('../models/Admin.model');

// 👤 GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const { userId, role } = req.user; // Từ JWT token

    let user;
    let Model;

    // Chọn Model dựa vào role
    if (role === 'student') {
      Model = Student;
    } else if (role === 'employer') {
      Model = Employer;
    } else if (role === 'admin') {
      Model = Admin;
    }

    // Tìm user và loại bỏ password
    user = await Model.findById(userId).select('-password');

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
    const updateData = req.body;

    // Không cho phép update các field nhạy cảm
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

    const user = await Model.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật profile thành công',
      profile: user,
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
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

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    // Cập nhật mật khẩu mới
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