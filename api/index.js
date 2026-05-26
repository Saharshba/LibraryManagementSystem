const serverless = require('serverless-http');
const connectDB = require('../server/src/config/db');
const seedAdmin = require('../server/src/utils/seedAdmin');
const app = require('../server/src/app');

let serverlessHandler;
let readyPromise;

const ensureReady = () => {
  if (!readyPromise) {
    readyPromise = connectDB()
      .then(() => seedAdmin())
      .catch((error) => {
        readyPromise = null;
        throw error;
      });
  }

  return readyPromise;
};

module.exports = async (req, res) => {
  try {
    await ensureReady();

    if (!serverlessHandler) {
      serverlessHandler = serverless(app);
    }

    return await serverlessHandler(req, res);
  } catch (error) {
    console.error('API handler error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        message:
          error.message === 'MONGODB_URI is not defined' || error.message === 'JWT_SECRET is not defined'
            ? 'Server is misconfigured. Set MONGODB_URI and JWT_SECRET in Vercel environment variables.'
            : error.message || 'Internal server error',
      })
    );
  }
};
