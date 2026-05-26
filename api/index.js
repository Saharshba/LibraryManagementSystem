const path = require('path');

if (!process.env.VERCEL) {
  require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
}

const connectDB = require('../server/src/config/db');
const seedAdmin = require('../server/src/utils/seedAdmin');
const app = require('../server/src/app');

const runExpress = (req, res) =>
  new Promise((resolve, reject) => {
    let settled = false;

    const finish = (error) => {
      if (settled) {
        return;
      }

      settled = true;
      res.removeListener('finish', onFinish);
      res.removeListener('close', onFinish);
      res.removeListener('error', onError);

      if (error) {
        reject(error);
        return;
      }

      resolve();
    };

    const onFinish = () => finish();
    const onError = (error) => finish(error);

    res.on('finish', onFinish);
    res.on('close', onFinish);
    res.on('error', onError);

    app(req, res);
  });

let initPromise = null;

const initialize = async () => {
  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error('JWT_SECRET is not set in Vercel environment variables');
  }

  if (!initPromise) {
    initPromise = (async () => {
      await connectDB();
      await seedAdmin();
    })().catch((error) => {
      initPromise = null;
      throw error;
    });
  }

  return initPromise;
};

module.exports = async (req, res) => {
  try {
    await initialize();
    await runExpress(req, res);
  } catch (error) {
    console.error('API handler error:', error);

    if (!res.headersSent) {
      const isTimeout =
        error.message?.includes('timed out') || error.message?.includes('MongoDB connection');

      res.statusCode = isTimeout ? 503 : 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(
        JSON.stringify({
          message: error.message || 'Internal server error',
        })
      );
    }
  }
};
