const axios = require('axios');
const cheerio = require('cheerio');
const pLimit = require('p-limit');
const { env } = require('../config');
const { AppError } = require('../utils/errors');
const logger = require('../logger');

// Concurrency gate using p-limit to prevent socket/memory exhaustion
const limit = pLimit(env.CONCURRENCY_LIMIT);

/**
 * Performs the URL audit using axios and cheerio
 * @param {string} targetUrl 
 * @returns {Promise<Object>}
 */
const performAudit = async (targetUrl) => {
  return limit(async () => {
    const startTime = Date.now();
    try {
      // Axios request with strict timeout
      const response = await axios.get(targetUrl, {
        timeout: env.REQUEST_TIMEOUT_MS,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'PagePulse-AuditService/1.0',
        },
      });

      const responseTimeMs = Date.now() - startTime;
      const html = response.data;
      const contentType = response.headers['content-type'] || '';
      const contentLength = response.headers['content-length'] 
        ? parseInt(response.headers['content-length'], 10) 
        : Buffer.byteLength(typeof html === 'string' ? html : '');

      // Parse metadata if it's HTML
      let pageTitle = null;
      let metaDescription = null;

      if (contentType.includes('text/html')) {
        const $ = cheerio.load(html);
        pageTitle = $('title').text().trim() || null;
        metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
      }

      return {
        originalUrl: targetUrl,
        finalUrl: response.request.res.responseUrl || targetUrl,
        statusCode: response.status,
        responseTimeMs,
        contentType,
        contentLength,
        pageTitle,
        metaDescription,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      const responseTimeMs = Date.now() - startTime;
      logger.error({ err: error, targetUrl }, 'Audit failed');

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          originalUrl: targetUrl,
          finalUrl: error.request.res?.responseUrl || targetUrl,
          statusCode: error.response.status,
          responseTimeMs,
          contentType: error.response.headers['content-type'] || null,
          contentLength: null,
          pageTitle: null,
          metaDescription: null,
          timestamp: new Date().toISOString(),
          error: error.message,
        };
      } else if (error.request) {
        // The request was made but no response was received (e.g., timeout)
        throw new AppError(`Request to ${targetUrl} failed: ${error.message}`, 504);
      } else {
        // Something happened in setting up the request
        throw new AppError(`Failed to process audit: ${error.message}`, 500);
      }
    }
  });
};

module.exports = {
  performAudit,
};
