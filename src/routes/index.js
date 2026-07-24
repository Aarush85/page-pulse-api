const express = require('express');
const { auditUrl } = require('../controllers/audit.controller');
const { healthCheck, serveLandingPage } = require('../controllers/ui.controller');
const { validate, auditRequestSchema } = require('../validators/audit.validator');
const { apiRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Root route (HTML Landing Page)
router.get('/', serveLandingPage);

// Health Check
router.get('/health', healthCheck);

// API Routes
router.post('/api/audit', apiRateLimiter, validate(auditRequestSchema), auditUrl);

module.exports = router;
