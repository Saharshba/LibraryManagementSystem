const serverless = require('serverless-http');
const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');
const seedAdmin = require('../server/src/utils/seedAdmin');

let initializationPromise = null;

const withTimeout = async (promise, timeoutMs, label) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const ensureReady = async () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        await withTimeout(connectDB(), 10000, 'MongoDB connection');
        await withTimeout(seedAdmin(), 10000, 'Admin seed');
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
