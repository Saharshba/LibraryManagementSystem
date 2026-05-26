const serverless = require('serverless-http');
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');
const seedAdmin = require('../server/src/utils/seedAdmin');

let initializationPromise = null;

const ensureReady = async () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await connectDB();
        await seedAdmin();
      } catch (error) {
        initializationPromise = null;
        throw error;
      }
    })();
  }

  return initializationPromise;
};

const handler = serverless(app);

module.exports = async (req, res) => {
  await ensureReady();
  return handler(req, res);
};
