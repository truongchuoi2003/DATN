const Notification = require('../models/Notification.model');
const mongoose = require('mongoose');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getMyNotifications = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);

    const notifications = await Notification.find({
      recipientId: userId,
      recipientRole: role,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('❌ Get my notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách thông báo',
      error: error.message,
    });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, role } = req.user;

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      recipientRole: role,
      isRead: false,
    });

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải số lượng thông báo chưa đọc',
      error: error.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { notificationId } = req.params;

    if (!isValidObjectId(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'NotificationId không hợp lệ',
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: userId,
      recipientRole: role,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông báo',
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
      notification,
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật thông báo',
      error: error.message,
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId, role } = req.user;

    await Notification.updateMany(
      {
        recipientId: userId,
        recipientRole: role,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Đã đánh dấu tất cả là đã đọc',
    });
  } catch (error) {
    console.error('❌ Mark all notifications as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật tất cả thông báo',
      error: error.message,
    });
  }
};