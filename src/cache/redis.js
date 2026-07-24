const Redis = require('ioredis');
const { env } = require('../config');
const logger = require('../logger');

// Create Redis client instance
const redisClient = new Redis(env.REDIS_URL, {
  // Retry strategy for resilient connection
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis successfully');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

/**
 * Gets a value from the cache.
 * @param {string} key 
 * @returns {Promise<Object|null>}
 */
const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error({ err: error, key }, 'Error reading from cache');
    return null; // Fallback gracefully if cache fails
  }
};

/**
 * Sets a value in the cache with the configured TTL.
 * @param {string} key 
 * @param {Object} value 
 * @returns {Promise<void>}
 */
const setCache = async (key, value) => {
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.set(key, stringValue, 'EX', env.CACHE_TTL_SECONDS);
  } catch (error) {
    logger.error({ err: error, key }, 'Error writing to cache');
  }
};

module.exports = {
  redisClient,
  getCache,
  setCache,
};
