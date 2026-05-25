const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { buildUserResponse, createUserAccount, findUserByUsername } = require('../utils/userAccounts');

const listUsers = async (req, res) => {
  const users = await User.find({ role: 'user' })
    .select('username fullName email address contactNumber membership role createdAt')
    .sort({ username: 1 });
  return res.json({ users });
};

const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { username, password, fullName, email, address, contactNumber } = req.body;
  const existingUser = await findUserByUsername(username);

  if (existingUser) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  const user = await createUserAccount({ username, password, role: 'user', fullName, email, address, contactNumber });
  return res.status(201).json({ user: buildUserResponse(user) });
};

const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { username, password, fullName, email, address, contactNumber } = req.body;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (username && username !== user.username) {
    const usernameExists = await findUserByUsername(username);
    if (usernameExists && usernameExists._id.toString() !== id) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    user.username = username;
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    user.email = email;
  }

  if (fullName) user.fullName = fullName;
  if (address) user.address = address;
  if (contactNumber) user.contactNumber = contactNumber;

  if (password) {
    user.passwordHash = await bcrypt.hash(password, 12);
  }

  await user.save();
  return res.json({ user: buildUserResponse(user) });
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ message: 'User deleted' });
};

const updateMembership = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  const { id } = req.params;
  const { membershipFee, nextDueDate, paymentDate, paymentAmount, paymentNote } = req.body;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (!user.membership) {
    user.membership = { membershipFee: 0, nextDueDate: null, paymentHistory: [] };
  }

  if (membershipFee !== undefined && membershipFee !== '') {
    user.membership.membershipFee = Number(membershipFee);
  }

  if (nextDueDate !== undefined && nextDueDate !== '') {
    user.membership.nextDueDate = new Date(nextDueDate);
  }

  const hasPaymentEntry = paymentDate || paymentAmount || paymentNote;
  if (hasPaymentEntry) {
    user.membership.paymentHistory.push({
      paidOn: paymentDate ? new Date(paymentDate) : new Date(),
      amount: paymentAmount !== undefined && paymentAmount !== '' ? Number(paymentAmount) : user.membership.membershipFee || 0,
      note: paymentNote || '',
    });
  }

  await user.save();
  return res.json({ user: buildUserResponse(user) });
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  updateMembership,
};
