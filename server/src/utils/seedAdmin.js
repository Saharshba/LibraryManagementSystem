const bcrypt = require('bcryptjs');
const User = require('../models/User');

const SEED_ACCOUNTS = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    fullName: 'Bhaskar Admin',
    email: 'admin@bhaskarbookscorner.local',
    address: 'Library Headquarters',
    contactNumber: '0000000000',
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user',
    fullName: 'Bhaskar Reader',
    email: 'user@bhaskarbookscorner.local',
    address: 'Reader Lane',
    contactNumber: '9999999999',
  },
];

const seedAdmin = async () => {
  for (const account of SEED_ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 12);
    await User.updateOne(
      { username: account.username },
      {
        $set: {
          passwordHash,
          role: account.role,
          fullName: account.fullName,
          email: account.email,
          address: account.address,
          contactNumber: account.contactNumber,
        },
        $setOnInsert: {
          membership: {
            membershipFee: 0,
            nextDueDate: null,
            paymentHistory: [],
          },
        },
      },
      { upsert: true }
    );
  }
};

module.exports = seedAdmin;
