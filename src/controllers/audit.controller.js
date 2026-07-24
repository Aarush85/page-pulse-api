const { performAudit } = require('../services/audit.service');
const { getCache, setCache } = require('../cache/redis');
const { generateSHA256, normalizeUrl } = require('../utils/hash');

/**
 * Controller for handling audit requests
 */
const auditUrl = async (req, res, next) => {
  try {
    const rawUrl = req.body.url;
    const normalizedUrl = normalizeUrl(rawUrl);
    const cacheKey = `cache:${generateSHA256(normalizedUrl)}`;

    // Pass auditedUrl to res.locals for the logger middleware
    res.locals.auditedUrl = normalizedUrl;

    // Check Cache
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) {
      res.locals.cacheHit = true;
      cachedResult.cached = true;
      return res.status(200).json(cachedResult);
    }

    res.locals.cacheHit = false;

    // Perform the Audit
    const auditResult = await performAudit(normalizedUrl);
    auditResult.cached = false;

    // Cache the result (only if it was a successful 2xx response)
    if (auditResult.statusCode >= 200 && auditResult.statusCode < 300) {
      await setCache(cacheKey, auditResult);
    }

    return res.status(200).json(auditResult);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  auditUrl,
};
