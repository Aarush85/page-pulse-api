const pino = require('pino');
const { env } = require('../config');

const isProduction = process.env.NODE_ENV === 'production';

// Pino JSON structured logger
const logger = pino({
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isProduction ? {} : {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
});

module.exports = logger;
