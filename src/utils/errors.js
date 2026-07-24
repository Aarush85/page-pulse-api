/**
 * Base custom error class
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 404 Not Found
 */
class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
};
