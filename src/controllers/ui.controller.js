const path = require('path');
const { redisClient } = require('../cache/redis');

/**
 * Health check endpoint
 */
const healthCheck = (req, res) => {
  const redisStatus = redisClient.status === 'ready' ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'ok',
    redis: redisStatus,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Serves the landing page HTML
 */
const serveLandingPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
};

module.exports = {
  healthCheck,
  serveLandingPage,
};
