import http from 'http';
import fs from 'fs';

const testUrls = [
  '/',
  '/calculators/concrete/',
  '/blog/'
];

const port = 3000;
let server;

// Simple static file server
const startServer = () => {
  return new Promise((resolve) => {
    server = http.createServer((req, res) => {
      let filePath = 'dist' + req.url;
      if (filePath.endsWith('/')) {
        filePath += 'index.html';
      }

      try {
        const content = fs.readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const contentType = {
          'html': 'text/html',
          'css': 'text/css',
          'js': 'application/javascript',
          'json': 'application/json'
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (err) {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, () => {
      console.log(`Test server running on port ${port}`);
      resolve();
    });
  });
};

const testUrl = (url) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}${url}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ ${url} - Status: ${res.statusCode}`);

          // Basic CSP compliance check - no inline handlers
          const hasInlineHandlers = data.match(/on(click|change|load|submit)\s*=/i);
          if (hasInlineHandlers) {
            console.log(`✗ ${url} - Found inline event handlers`);
            reject(new Error(`Inline handlers found in ${url}`));
          } else {
            console.log(`✓ ${url} - No inline handlers found`);
          }

          resolve();
        } else {
          console.log(`✗ ${url} - Status: ${res.statusCode}`);
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log(`✗ ${url} - Error: ${err.message}`);
      reject(err);
    });
  });
};

const runTests = async () => {
  try {
    await startServer();

    console.log('\nRunning smoke tests...\n');

    for (const url of testUrls) {
      await testUrl(url);
    }

    console.log('\n✓ All smoke tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Smoke tests failed:', error.message);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
};

runTests();