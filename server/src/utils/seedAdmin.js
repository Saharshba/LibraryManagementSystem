const { ensureUserAccount } = require('./userAccounts');

const seedAdmin = async () => {
  const admin = await ensureUserAccount({
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Bhaskar Admin',
    email: 'admin@bhaskarbookscorner.local',
    address: 'Library Headquarters',
    contactNumber: '0000000000',
    membership: {
      membershipFee: 0,
      nextDueDate: null,
      paymentHistory: [],
    },
  });
  const user = await ensureUserAccount({
    username: 'user',
    password: 'user123',
    role: 'user',
    fullName: 'Bhaskar Reader',
    email: 'user@bhaskarbookscorner.local',
    address: 'Reader Lane',
    contactNumber: '9999999999',
    membership: {
      membershipFee: 0,
      nextDueDate: null,
      paymentHistory: [],
    },
  });

  return { admin, user };
};

module.exports = seedAdmin;
