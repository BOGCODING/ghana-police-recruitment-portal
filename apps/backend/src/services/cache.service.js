const { cacheGet, cacheSet, cacheDelete } = require('../config/redis');

/**
 * Cache Service - Handles data caching using Redis
 */
const CacheService = {
  /**
   * Get value from cache
   * @param {string} key
   */
  async get(key) {
    return await cacheGet(key);
  },

  /**
   * Set value in cache
   * @param {string} key
   * @param {any} value
   * @param {number} ttl - Time to live in seconds
   */
  async set(key, value, ttl = 3600) {
    return await cacheSet(key, value, ttl);
  },

  /**
   * Delete from cache
   * @param {string} key
   */
  async del(key) {
    return await cacheDelete(key);
  },

  /**
   * Helper to get from cache or fetch from source and then cache
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   * @param {Function} fn - Source fetch function
   */
  async wrap(key, ttl, fn) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) return cached;

    const result = await fn();
    if (result !== null && result !== undefined) {
      await this.set(key, result, ttl);
    }
    return result;
  }
};

module.exports = CacheService;
