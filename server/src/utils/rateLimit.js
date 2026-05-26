const rateLimit = require('express-rate-limit');

const serverlessKeyGenerator = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.headers['x-real-ip'] ||
  req.socket?.remoteAddress ||
  'anonymous';

const serverlessRateLimit = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
    keyGenerator: serverlessKeyGenerator,
    ...options,
  });

module.exports = { serverlessRateLimit };
