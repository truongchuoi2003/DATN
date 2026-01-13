const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');

// GET /api/profile/me
exports.getMyProfile = async (req, res) => {
  try {
    const role = req.user.role;
    if (role === 'student') {
      const profile = await Student.findOne({ _id: req.user._id }) // if you used Student as the user document
        .lean();
      // if your auth stores User in req.user but Student is a separate doc, adjust to find by userId
      // const profile = await Student.findOne({ userId: req.user._id }).lean();
      return res.json(profile || {});
    } else if (role === 'employer') {
      const profile = await Employer.findOne({ _id: req.user._id }).lean();
      // or findOne({ userId: req.user._id })
      return res.json(profile || {});
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (err) {
    console.error('getMyProfile error', err);
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/profile/me
exports.updateMyProfile = async (req, res) => {
  try {
    const role = req.user.role;
    const data = req.body || {};

    if (role === 'student') {
      const allowed = ['fullName','birthday','phone','university','major','graduationYear','skills','resumeUrl','avatar','bio','address','location'];
      const payload = {};
      allowed.forEach(k => {
        if (data[k] !== undefined) payload[k] = data[k];
      });
      // normalize skills if string
      if (payload.skills && typeof payload.skills === 'string') {
        payload.skills = payload.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      // ensure location shape if provided
      if (payload.location && payload.location.coordinates) {
        // assume client sends { type: 'Point', coordinates: [lng,lat] }
      }
      const profile = await Student.findOneAndUpdate(
        { _id: req.user._id },
        { $set: payload },
        { new: true, upsert: true }
      );
      return res.json(profile);
    } else if (role === 'employer') {
      const allowed = ['companyName','fullName','phone','address','description','logo','website','location'];
      const payload = {};
      allowed.forEach(k => {
        if (data[k] !== undefined) payload[k] = data[k];
      });
      const profile = await Employer.findOneAndUpdate(
        { _id: req.user._id },
        { $set: payload },
        { new: true, upsert: true }
      );
      return res.json(profile);
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }
  } catch (err) {
    console.error('updateMyProfile error', err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/profile/me/upload-resume  (student)
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File missing' });
    const url = `/uploads/${req.file.filename}`;
    const profile = await Student.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { resumeUrl: url } },
      { new: true, upsert: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error('uploadResume error', err);
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/profile/me/upload-logo  (employer)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File missing' });
    const url = `/uploads/${req.file.filename}`;
    const profile = await Employer.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { logo: url } },
      { new: true, upsert: true }
    );
    return res.json(profile);
  } catch (err) {
    console.error('uploadLogo error', err);
    return res.status(500).json({ message: err.message });
  }
};
