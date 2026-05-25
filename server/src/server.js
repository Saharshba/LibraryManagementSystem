require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
const { startScheduler } = require('./jobs/requestCleanup');

const port = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await seedAdmin();
  startScheduler();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
