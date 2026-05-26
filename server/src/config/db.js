const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const CONNECT_TIMEOUT_MS = 6000;
const DEFAULT_DB_NAME = 'library_management';

const getDatabaseName = () => process.env.MONGODB_DB_NAME?.trim() || DEFAULT_DB_NAME;

const getUri = () => {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }

  return uri;
};

const getCache = () => {
  if (!global.__libraryDb) {
    global.__libraryDb = { conn: null, promise: null };
  }

  return global.__libraryDb;
};

const resetCache = () => {
  const cache = getCache();
  cache.conn = null;
  cache.promise = null;
};

const connectDB = async () => {
  const databaseName = getDatabaseName();

  if (mongoose.connection.readyState === 1) {
    if (mongoose.connection.db?.databaseName === databaseName) {
      return mongoose.connection;
    }

    await mongoose.disconnect();
    resetCache();
  }

  const cache = getCache();

  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (mongoose.connection.readyState === 2 || mongoose.connection.readyState === 3) {
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.warn('Mongo disconnect warning:', error.message);
    }
    resetCache();
  }

  if (!cache.promise) {
    const uri = getUri();

    cache.promise = mongoose
      .connect(uri, {
        dbName: databaseName,
        serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
        connectTimeoutMS: CONNECT_TIMEOUT_MS,
        socketTimeoutMS: 15000,
        maxPoolSize: 1,
        minPoolSize: 0,
        autoIndex: false,
      })
      .then((instance) => {
        cache.conn = instance.connection;
        console.log(`MongoDB connected to database: ${instance.connection.db.databaseName}`);
        return cache.conn;
      })
      .catch((error) => {
        resetCache();
        throw error;
      });
  }

  const timeoutMessage =
    'MongoDB connection timed out. In Atlas: Network Access → allow 0.0.0.0/0, verify MONGODB_URI user/password, then redeploy.';

  return Promise.race([
    cache.promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(timeoutMessage)), CONNECT_TIMEOUT_MS + 1000);
    }),
  ]);
};

module.exports = connectDB;
module.exports.getDatabaseName = getDatabaseName;
module.exports.DEFAULT_DB_NAME = DEFAULT_DB_NAME;
