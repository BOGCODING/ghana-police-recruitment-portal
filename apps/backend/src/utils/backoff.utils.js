/**
 * Exponential Backoff Utility
 * Calculates delay with jitter to prevent thundering herd problems.
 */
const backoffUtils = {
  /**
   * Calculate exponential delay
   * @param {number} retryCount - Number of retries so far
   * @param {number} baseDelay - Base delay in ms (default 1000)
   * @param {number} maxDelay - Maximum delay in ms (default 30000)
   * @param {boolean} withJitter - Whether to add random jitter (default true)
   * @returns {number} Delay in ms
   */
  getExponentialDelay(retryCount, baseDelay = 1000, maxDelay = 30000, withJitter = true) {
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    
    if (withJitter) {
      // Add random jitter (0% to 20% of the delay)
      const jitter = delay * 0.2 * Math.random();
      return delay + jitter;
    }
    
    return delay;
  },

  /**
   * Get formatted lockout time (Human readable)
   * @param {number} attempts - Number of failed attempts
   * @returns {number} Duration in milliseconds
   */
  getLockoutDuration(attempts) {
    // 3 attempts: 5 mins
    // 4 attempts: 15 mins
    // 5 attempts: 1 hour
    // 6+ attempts: 24 hours
    if (attempts === 3) return 5 * 60 * 1000;
    if (attempts === 4) return 15 * 60 * 1000;
    if (attempts === 5) return 60 * 60 * 1000;
    if (attempts >= 6) return 24 * 60 * 60 * 1000;
    return 0;
  }
};

module.exports = backoffUtils;
