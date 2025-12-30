const RedirectValidator = require('../utils/redirectValidator');
const logger = require('../utils/logger');

function testRedirect() {
  const testUrls = [
    { url: '/dashboard', expected: true },
    { url: 'https://google.com', expected: false },
    { url: 'http://localhost:3000/callback', expected: true },
    { url: '//evil.com', expected: false },
    { url: 'javascript:alert(1)', expected: false }
  ];

  logger.info('--- Open Redirect Validation Test ---');
  
  for (const test of testUrls) {
    const isSafe = RedirectValidator.isSafeUrl(test.url);
    const passed = isSafe === test.expected;
    logger.info(`URL: ${test.url} | Safe: ${isSafe} | Result: ${passed ? 'PASSED' : 'FAILED'}`);
  }
}

testRedirect();
