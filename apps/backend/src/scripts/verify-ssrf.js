const SSRFValidator = require('../utils/ssrfValidator');
const logger = require('../utils/logger');

async function testSSRF() {
  const testUrls = [
    { url: 'https://google.com', expected: true },
    { url: 'http://127.0.0.1', expected: false },
    { url: 'http://localhost', expected: false },
    { url: 'http://169.254.169.254', expected: false }, // AWS Metadata
    { url: 'https://10.0.0.1', expected: false },
    { url: 'http://192.168.1.1', expected: false }
  ];

  logger.info('--- SSRF Validation Test ---');
  
  for (const test of testUrls) {
    const isSafe = await SSRFValidator.isSafeUrl(test.url);
    const passed = isSafe === test.expected;
    logger.info(`URL: ${test.url} | Safe: ${isSafe} | Result: ${passed ? 'PASSED' : 'FAILED'}`);
  }
}

if (require.main === module) {
  testSSRF().catch(err => logger.error('Test error:', err));
}
