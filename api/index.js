const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const serverless = require('serverless-http');
const connectDB = require('../server/src/config/db');
const seedAdmin = require('../server/src/utils/seedAdmin');
const app = require('../server/src/app');

let serverlessHandler;
let dbReadyPromise;
let seedPromise;

const needsDatabase = (req) => {
  const path = (req.url || '').split('?')[0];
  return path !== '/api/health';
};

const ensureDatabase = async () => {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDB();
  }

  await dbReadyPromise;

  if (!seedPromise) {
    seedPromise = seedAdmin().catch((error) => {
      seedPromise = null;
      console.error('Seed failed:', error);
      throw error;
    });
  }

  await seedPromise;
};

module.exports = async (req, res) => {
  try {
    if (needsDatabase(req)) {
      await ensureDatabase();
    }

    if (!serverlessHandler) {
      serverlessHandler = serverless(app);
    }

    return await serverlessHandler(req, res);
  } catch (error) {
    console.error('API handler error:', error);

    if (!res.headersSent) {
      res.statusCode = error.message?.includes('timed out') ? 503 : 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message:
            error.message === 'MONGODB_URI is not defined'
              ? 'Server is misconfigured. Set MONGODB_URI in Vercel environment variables.'
              : error.message || 'Internal server error',
        })
      );
    }
  }
};
