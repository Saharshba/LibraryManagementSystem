const User = require('../models/User');

const ADMIN_PASSWORD_HASH = '$2a$10$waphk26UEMNG.7xiErwtMOm5/WWSAOBkNXDSyFL40EbY0DBh4KJ4S';
const USER_PASSWORD_HASH = '$2a$10$m/QQ1XfykkQnG.Ou13qEiOm95oGWQUCVpz.wtuYzm.f.4cBpTzpfG';

const SEED_ACCOUNTS = [
  {
    username: 'BhaskarAdmin',
    passwordHash: ADMIN_PASSWORD_HASH,
    role: 'admin',
    fullName: 'Bhaskar Admin',
    email: 'bhaskaradmin@bhaskarbookscorner.local',
    address: 'Library Headquarters',
    contactNumber: '0000000000',
  },
  {
    username: 'user',
    passwordHash: USER_PASSWORD_HASH,
    role: 'user',
    fullName: 'Bhaskar Reader',
    email: 'user@bhaskarbookscorner.local',
    address: 'Reader Lane',
    contactNumber: '9999999999',
  },
];

const LEGACY_ADMIN_USERNAMES = ['admin'];

let seedPromise = null;

const seedAdmin = async () => {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    await User.deleteMany({ username: { $in: LEGACY_ADMIN_USERNAMES } });

    await User.bulkWrite(
      SEED_ACCOUNTS.map((account) => ({
        updateOne: {
          filter: { username: account.username },
          update: {
            $set: {
              passwordHash: account.passwordHash,
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
          upsert: true,
        },
      }))
    );
  })().catch((error) => {
    seedPromise = null;
    throw error;
  });

  return seedPromise;
};

module.exports = seedAdmin;
