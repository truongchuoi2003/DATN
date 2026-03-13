const Notification = require('../models/Notification.model');

const VALID_MODEL_BY_ROLE = {
  student: 'Student',
  employer: 'Employer',
  admin: 'Admin',
};

exports.createNotification = async ({
  recipientId,
  recipientRole,
  recipientModel,
  title,
  message,
  type = 'system',
  link = '',
  metadata = {},
}) => {
  try {
    if (!recipientId || !recipientRole || !title || !message) {
      return null;
    }

    const finalRecipientModel =
      recipientModel || VALID_MODEL_BY_ROLE[recipientRole];

    if (!finalRecipientModel) {
      return null;
    }

    return await Notification.create({
      recipientId,
      recipientRole,
      recipientModel: finalRecipientModel,
      title: String(title).trim(),
      message: String(message).trim(),
      type,
      link: String(link || '').trim(),
      metadata,
    });
  } catch (error) {
    console.error('❌ Create notification error:', error.message);
    return null;
  }
};