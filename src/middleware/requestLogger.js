const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');

/**
 * Middleware to assign a unique ID to each request and log the request/response cycle.
 */
const requestLogger = (req, res, next) => {
  req.id = uuidv4();
  req.startTime = Date.now();

  // Log incoming request
  logger.debug({
    requestId: req.id,
    method: req.method,
    endpoint: req.originalUrl,
    clientIp: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Incoming request');

  // Hook into response finish to log completion
  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime;
    
    const logData = {
      requestId: req.id,
      method: req.method,
      endpoint: req.originalUrl,
      clientIp: req.ip,
      statusCode: res.statusCode,
      responseTime,
      cacheHit: res.locals.cacheHit || false,
    };

    if (res.locals.auditedUrl) {
      logData.auditedUrl = res.locals.auditedUrl;
    }

    if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed with error');
    } else {
      logger.info(logData, 'Request completed successfully');
    }
  });

  next();
};

module.exports = requestLogger;
