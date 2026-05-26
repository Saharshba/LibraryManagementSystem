const bcrypt = require('bcryptjs');
const { ensureUserAccount } = require('./userAccounts');

const syncSeedPassword = async (user, password) => {
  if (!user) {
    return user;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
  }

  return user;
};

const seedAdmin = async () => {
  const admin = await syncSeedPassword(
    await ensureUserAccount({
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
    }),
    'admin123'
  );

  const user = await syncSeedPassword(
    await ensureUserAccount({
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
    }),
    'user123'
  );

  return { admin, user };
};

module.exports = seedAdmin;
