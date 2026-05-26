const connectDB = require('../server/src/config/db');
const { getDatabaseName } = require('../server/src/config/db');

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

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        status: 'ready',
        database: getDatabaseName(),
        connected: true,
      })
    );
  } catch (error) {
    console.error('Ready check failed:', error);
    res.statusCode = 503;
    res.end(
      JSON.stringify({
        status: 'not-ready',
        message: error.message,
      })
    );
  }
};
