const Student = require('../models/Student.model');
const Employer = require('../models/Employer.model');
const Admin = require('../models/Admin.model');

const USER_MODELS = {
  student: Student,
  employer: Employer,
  admin: Admin,
};

async function findUserByIdAndRole(userId, role) {
  const Model = USER_MODELS[role];
  if (!Model) return null;

  const user = await Model.findById(userId);
  if (!user) return null;

  return { user, role, Model };
}

module.exports = {
  USER_MODELS,
  findUserByIdAndRole,
};