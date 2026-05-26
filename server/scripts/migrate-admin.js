/**
 * One-time migration: update MongoDB admin user to BhaskarAdmin / <seeded-password>
 * Run from repo root: npm run migrate:admin --workspace server
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const { ADMIN_ACCOUNT, LEGACY_ADMIN_USERNAMES } = require('../src/constants/adminAccount');

const migrateAdmin = async () => {
  await connectDB();

  const legacyAdmin = await User.findOne({ username: { $in: LEGACY_ADMIN_USERNAMES } });
  let adminUser = await User.findOne({ username: ADMIN_ACCOUNT.username });

  if (legacyAdmin && !adminUser) {
    legacyAdmin.username = ADMIN_ACCOUNT.username;
    legacyAdmin.passwordHash = ADMIN_ACCOUNT.passwordHash;
    legacyAdmin.role = ADMIN_ACCOUNT.role;
    legacyAdmin.fullName = ADMIN_ACCOUNT.fullName;
    legacyAdmin.email = ADMIN_ACCOUNT.email;
    legacyAdmin.address = ADMIN_ACCOUNT.address;
    legacyAdmin.contactNumber = ADMIN_ACCOUNT.contactNumber;
    if (!legacyAdmin.membership) {
      legacyAdmin.membership = ADMIN_ACCOUNT.membership;
    }

    await legacyAdmin.save();
    adminUser = legacyAdmin;
    console.log('Renamed legacy admin account to BhaskarAdmin (same user id preserved).');
  } else if (adminUser) {
    adminUser.passwordHash = ADMIN_ACCOUNT.passwordHash;
    adminUser.role = ADMIN_ACCOUNT.role;
    adminUser.fullName = ADMIN_ACCOUNT.fullName;
    adminUser.email = ADMIN_ACCOUNT.email;
    adminUser.address = ADMIN_ACCOUNT.address;
    adminUser.contactNumber = ADMIN_ACCOUNT.contactNumber;
    await adminUser.save();
    console.log('Updated existing BhaskarAdmin account in MongoDB.');
  } else {
    adminUser = await User.create({
      username: ADMIN_ACCOUNT.username,
      passwordHash: ADMIN_ACCOUNT.passwordHash,
      role: ADMIN_ACCOUNT.role,
      fullName: ADMIN_ACCOUNT.fullName,
      email: ADMIN_ACCOUNT.email,
      address: ADMIN_ACCOUNT.address,
      contactNumber: ADMIN_ACCOUNT.contactNumber,
      membership: ADMIN_ACCOUNT.membership,
    });
    console.log('Created BhaskarAdmin account in MongoDB.');
  }

  const removed = await User.deleteMany({
    username: { $in: LEGACY_ADMIN_USERNAMES },
    _id: { $ne: adminUser._id },
  });

  if (removed.deletedCount > 0) {
    console.log(`Removed ${removed.deletedCount} legacy admin account(s).`);
  }

  console.log('\nMongoDB admin credentials are now:');
  console.log(`  Username: ${ADMIN_ACCOUNT.username}`);
  console.log(`  Password: ${ADMIN_ACCOUNT.password}`);
  console.log(`  User id:  ${adminUser._id.toString()}`);
};

migrateAdmin()
  .then(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Migration failed:', error.message);
    const mongoose = require('mongoose');
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
