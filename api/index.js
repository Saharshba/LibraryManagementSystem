const serverless = require('serverless-http');
const connectDB = require('../server/src/config/db');
const seedAdmin = require('../server/src/utils/seedAdmin');
const app = require('../server/src/app');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    await seedAdmin();
    isConnected = true;
  }
  return serverless(app)(req, res);
};
