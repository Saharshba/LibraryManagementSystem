const bcrypt = require('bcryptjs');
const User = require('../models/User');

const buildUserResponse = (user) => ({
  id: user._id,
  username: user.username,
  fullName: user.fullName,
  email: user.email,
  address: user.address,
  contactNumber: user.contactNumber,
  membership: user.membership,
  role: user.role,
});

const findUserByUsername = async (username) => User.findOne({ username });

const createUserAccount = async ({
  username,
  password,
  role = 'user',
  fullName,
  email,
  address,
  contactNumber,
  membership = {},
}) => {
  const passwordHash = await bcrypt.hash(password, 12);
  return User.create({
    username,
    passwordHash,
    role,
    fullName,
    email,
    address,
    contactNumber,
    membership: {
      membershipFee: membership.membershipFee ?? 0,
      nextDueDate: membership.nextDueDate || null,
      paymentHistory: membership.paymentHistory || [],
    },
  });
};

const ensureUserAccount = async ({
  username,
  password,
  role = 'user',
  fullName,
  email,
  address,
  contactNumber,
  membership = {},
}) => {
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    let didChange = false;

    if (fullName && !existingUser.fullName) {
      existingUser.fullName = fullName;
      didChange = true;
    }

    if (email && !existingUser.email) {
      existingUser.email = email;
      didChange = true;
    }

    if (address && !existingUser.address) {
      existingUser.address = address;
      didChange = true;
    }

    if (contactNumber && !existingUser.contactNumber) {
      existingUser.contactNumber = contactNumber;
      didChange = true;
    }

    if (!existingUser.membership) {
      existingUser.membership = {
        membershipFee: membership.membershipFee ?? 0,
        nextDueDate: membership.nextDueDate || null,
        paymentHistory: membership.paymentHistory || [],
      };
      didChange = true;
    } else {
      if (existingUser.membership.membershipFee === undefined) {
        existingUser.membership.membershipFee = membership.membershipFee ?? 0;
        didChange = true;
      }

      if (existingUser.membership.nextDueDate === undefined) {
        existingUser.membership.nextDueDate = membership.nextDueDate || null;
        didChange = true;
      }

      if (!existingUser.membership.paymentHistory) {
        existingUser.membership.paymentHistory = membership.paymentHistory || [];
        didChange = true;
      }
    }

    if (didChange) {
      await existingUser.save();
    }

    return existingUser;
  }

  return createUserAccount({ username, password, role, fullName, email, address, contactNumber, membership });
};

module.exports = {
  buildUserResponse,
  findUserByUsername,
  createUserAccount,
  ensureUserAccount,
};
