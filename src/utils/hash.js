const crypto = require('crypto');

/**
 * Generates a SHA-256 hash of a given string.
 * @param {string} input - The string to hash (e.g. a normalized URL)
 * @returns {string} The SHA-256 hash in hex format
 */
const generateSHA256 = (input) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Normalizes a URL for consistent hashing.
 * Removes trailing slashes.
 * @param {string} url - The raw URL
 * @returns {string} The normalized URL
 */
const normalizeUrl = (url) => {
  try {
    const parsed = new URL(url);
    let normalized = parsed.toString();
    if (normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch (error) {
    // If parsing fails, fallback to simple trim
    return url.trim().replace(/\/$/, '');
  }
};

module.exports = {
  generateSHA256,
  normalizeUrl,
};
