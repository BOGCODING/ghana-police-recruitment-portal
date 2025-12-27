const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/system/settings',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      const banner = json.find(s => s.key === 'announcement_banner');
      if (banner) {
        console.log('Banner Setting:', banner.value);
        // Check if matches what we set
        const val = typeof banner.value === 'string' ? JSON.parse(banner.value) : banner.value;
        if (val.message === 'System Maintenance Scheduled for Tonight' && val.show === true) {
          console.log('VERIFICATION SUCCESS');
        } else {
          console.log('VERIFICATION FAILED: Value mismatch');
        }
      } else {
        console.log('VERIFICATION FAILED: Banner setting not found');
      }
    } catch (e) {
      console.error('Error parsing response:', e);
    }
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
