const { URL } = require('url');

/**
 * Redirect Validator Utility
 * Prevents "Open Redirect" vulnerabilities by ensuring URLs are internal or trusted.
 */
const RedirectValidator = {
  /**
   * Check if a URL is safe to redirect to
   * @param {string} urlString - The URL to check
   * @param {string[]} trustedDomains - Optional list of trusted external domains
   * @returns {boolean} - True if safe, false otherwise
   */
  isSafeUrl(urlString, trustedDomains = []) {
    if (!urlString) return false;

    // 1. Relative paths are generally safe (start with / and not //)
    if (urlString.startsWith('/') && !urlString.startsWith('//')) {
      return true;
    }

    try {
      const parsedUrl = new URL(urlString);
      
      // 2. Protocol must be http or https
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return false;
      }

      // 3. Domain must be trusted
      const baseDomain = process.env.FRONTEND_URL ? new URL(process.env.FRONTEND_URL).hostname : null;
      const adminDomain = process.env.ADMIN_URL ? new URL(process.env.ADMIN_URL).hostname : null;
      
      const allowedDomains = [
        baseDomain,
        adminDomain,
        'localhost',
        ...trustedDomains
      ].filter(Boolean);

      return allowedDomains.some(domain => {
        // Strict match or subdomain match
        return parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`);
      });
      
    } catch (error) {
      return false;
    }
  }
};

module.exports = RedirectValidator;
