const logger = require('../logger');
const { AppError } = require('../utils/errors');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log the error
  logger.error({
    err,
    requestId: req.id,
    path: req.path,
    method: req.method,
  }, err.message || 'Internal Server Error');

  // Do not expose stack traces in the response
  res.status(statusCode).json({
    error: isOperational ? err.message : 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && !isOperational && { details: err.message }),
  });
};

module.exports = errorHandler;
