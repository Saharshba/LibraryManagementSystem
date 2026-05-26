const ADMIN_PASSWORD_HASH = '$2a$10$waphk26UEMNG.7xiErwtMOm5/WWSAOBkNXDSyFL40EbY0DBh4KJ4S';

const ADMIN_ACCOUNT = {
  username: 'BhaskarAdmin',
  password: '<seeded-password>',
  passwordHash: ADMIN_PASSWORD_HASH,
  role: 'admin',
  fullName: 'Bhaskar Admin',
  email: 'bhaskaradmin@bhaskarbookscorner.local',
  address: 'Library Headquarters',
  contactNumber: '0000000000',
  membership: {
    membershipFee: 0,
    nextDueDate: null,
    paymentHistory: [],
  },
};

const LEGACY_ADMIN_USERNAMES = ['admin'];

module.exports = {
  ADMIN_ACCOUNT,
  LEGACY_ADMIN_USERNAMES,
};
