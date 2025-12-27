const API_URL = 'http://localhost:5000/api';

async function testLimiter(endpoint, maxRequests, delay = 0) {
  console.log(`\nTesting limiter on ${endpoint} (expecting limit at ${maxRequests} requests)...`);
  
  for (let i = 1; i <= maxRequests + 2; i++) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const duration = Date.now() - startTime;
      
      if (response.status === 429) {
        const data = await response.json();
        console.log(`[Request ${i}] 429 Too Many Requests (Correctly limited) - Message: ${data.message}`);
        return;
      } else {
        console.log(`[Request ${i}] Status: ${response.status} (${duration}ms)`);
      }
      
      if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay));
    } catch (error) {
      console.error(`[Request ${i}] Error: ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('--- Starting Rate Limit Tests ---');
  await testLimiter('/vouchers/check', 5);
  console.log('\n--- Tests Completed ---');
}

runTests();
