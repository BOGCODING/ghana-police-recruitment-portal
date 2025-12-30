const { URL } = require('url');
const net = require('net');
const dns = require('dns').promises;
const logger = require('./logger');

/**
 * SSRF Validator Utility
 * Prevents requests to internal, private, or restricted IP ranges
 */
const SSRFValidator = {
  // Private/Reserved IPv4 ranges
  privateIpv4Ranges: [
    /^127\./,       // Loopback
    /^10\./,        // Private (Class A)
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private (Class B)
    /^192\.168\./,  // Private (Class C)
    /^169\.254\./,  // Link-local
    /^0\./,          // Current network
    /^224\./,        // Multicast
    /^240\./         // Reserved
  ],

  // Private/Reserved IPv6 ranges
  privateIpv6Ranges: [
    /^::1$/,         // Loopback
    /^fc00:/,        // Unique local
    /^fe80:/         // Link-local
  ],

  /**
   * Check if an IP address is private or restricted
   * @param {string} ip - The IP address to check
   */
  isPrivateIp(ip) {
    if (net.isIPv4(ip)) {
      return this.privateIpv4Ranges.some(regex => regex.test(ip));
    }
    if (net.isIPv6(ip)) {
      return this.privateIpv6Ranges.some(regex => regex.test(ip.toLowerCase()));
    }
    return true; // Unknown IP version
  },

  /**
   * Validate a URL for safety against SSRF
   * @param {string} urlString - The URL to validate
   * @returns {Promise<boolean>} - True if safe, false otherwise
   */
  async isSafeUrl(urlString) {
    try {
      const parsedUrl = new URL(urlString);

      // Only allow http and https
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        logger.warn(`SSRF Block: Invalid protocol ${parsedUrl.protocol}`);
        return false;
      }

      const hostname = parsedUrl.hostname;

      // 1. Check if hostname itself is an IP
      if (net.isIP(hostname)) {
        if (this.isPrivateIp(hostname)) {
          logger.warn(`SSRF Block: Private IP detected ${hostname}`);
          return false;
        }
      }

      // 2. Resolve hostname to get all IPs
      try {
        const addresses = await dns.resolve(hostname);
        for (const address of addresses) {
          if (this.isPrivateIp(address)) {
            logger.warn(`SSRF Block: Hostname ${hostname} resolved to private IP ${address}`);
            return false;
          }
        }
      } catch (dnsError) {
        // If DNS fails, it might be an internal-only name
        logger.warn(`SSRF Block: DNS resolution failed for ${hostname}`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('SSRF Validation error:', error);
      return false;
    }
  }
};

module.exports = SSRFValidator;
