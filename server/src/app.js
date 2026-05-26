const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { serverlessRateLimit } = require('./utils/rateLimit');
const mongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/authRoutes');
const genreRoutes = require('./routes/genreRoutes');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const bookRequestRoutes = require('./routes/bookRequestRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(
  serverlessRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'library-api' });
});

app.get('/api/ready', async (req, res) => {
  try {
    const connectDB = require('./config/db');
    const { getDatabaseName } = require('./config/db');
    await connectDB();
    res.json({
      status: 'ready',
      database: getDatabaseName(),
      connected: true,
    });
  } catch (error) {
    res.status(503).json({ status: 'not-ready', message: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/book-requests', bookRequestRoutes);

// Serve client build when available (for deployments that build frontend into server)
const path = require('path');
const clientDist = path.join(__dirname, '../..', 'client', 'dist');

if (process.env.SERVE_CLIENT === 'true') {
  app.use(express.static(clientDist));

  app.get('*', (req, res) => {
    // If the request starts with /api, skip SPA fallback
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'Not found' });
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
