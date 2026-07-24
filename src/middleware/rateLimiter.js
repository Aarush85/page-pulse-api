const rateLimit = require('express-rate-limit');
const { env } = require('../config');
const logger = require('../logger');

/**
 * IP-based rate limiter middleware.
 * NOTE: For multi-instance distributed deployments, a Redis store 
 * (like rate-limit-redis) should be configured here.
 */
const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logger.warn({ ip: req.ip, path: req.path }, 'Rate limit exceeded');
    res.status(options.statusCode).json({
      error: 'Too Many Requests',
      message: options.message,
    });
  },
});

module.exports = {
  apiRateLimiter,
};
