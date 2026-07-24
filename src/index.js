const app = require('./app');
const { env } = require('./config');
const logger = require('./logger');

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled Rejection');
  shutdown();
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught Exception');
  shutdown();
});
