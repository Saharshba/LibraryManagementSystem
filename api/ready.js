const mongoose = require('mongoose');
const connectDB = require('../server/src/config/db');
const { getDatabaseName } = require('../server/src/config/db');
const User = require('../server/src/models/User');
const { ADMIN_ACCOUNT } = require('../server/src/constants/adminAccount');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in Vercel environment variables');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set in Vercel environment variables');
    }

    await connectDB();

    const mongoDatabase = mongoose.connection.db?.databaseName || getDatabaseName();
    const adminExists = await User.exists({ username: ADMIN_ACCOUNT.username, role: 'admin' });

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: 'ready',
        connected: true,
        databaseName: mongoDatabase,
        expectedDatabase: getDatabaseName(),
        adminUser: ADMIN_ACCOUNT.username,
        adminReady: Boolean(adminExists),
      })
    );
  } catch (error) {
    console.error('Ready check failed:', error);
    res.statusCode = 503;
    res.end(
      JSON.stringify({
        status: 'not-ready',
        connected: false,
        databaseName: getDatabaseName(),
        message: error.message,
      })
    );
  }
};
