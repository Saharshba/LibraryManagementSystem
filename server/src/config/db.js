const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const CONNECT_TIMEOUT_MS = 8000;

const getCached = () => {
  if (!global.__libraryMongoose) {
    global.__libraryMongoose = { conn: null, promise: null };
  }

  return global.__libraryMongoose;
};

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  const cached = getCached();

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
        connectTimeoutMS: CONNECT_TIMEOUT_MS,
        socketTimeoutMS: 20000,
        maxPoolSize: 1,
        minPoolSize: 0,
        family: 4,
        autoIndex: false,
      })
      .then((instance) => {
        cached.conn = instance.connection;
        return cached.conn;
      })
      .catch((error) => {
        cached.promise = null;
        cached.conn = null;
        throw error;
      });
  }

  const timeoutError = new Error(
    `Database connection timed out after ${CONNECT_TIMEOUT_MS}ms. Check MONGODB_URI and MongoDB Atlas network access (allow 0.0.0.0/0).`
  );

  try {
    return await Promise.race([
      cached.promise,
      new Promise((_, reject) => {
        setTimeout(() => reject(timeoutError), CONNECT_TIMEOUT_MS + 500);
      }),
    ]);
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    throw error;
  }
};

module.exports = connectDB;
