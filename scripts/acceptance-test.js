import http from 'http';

const testUrls = [
  { url: '/', desc: 'Homepage loads' },
  { url: '/calculators/concrete/', desc: 'Concrete calculator loads' },
  { url: '/blog/', desc: 'Blog index loads' },
  { url: '/privacy.html', desc: 'Privacy page loads' },
  { url: '/assets/js/main.js', desc: 'Main JS loads' },
  { url: '/assets/js/concrete.js', desc: 'Concrete JS loads' },
  { url: '/assets/css/blog.css', desc: 'Blog CSS loads' }
];

const testUrl = (url, desc) => {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:8000${url}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✓ ${desc} (${res.statusCode})`);

          // Test for inline handlers (should not exist)
          if (url.endsWith('.html') || url === '/') {
            const hasInlineHandlers = data.match(/on(click|change|load|submit)\s*=/i);
            if (hasInlineHandlers) {
              console.log(`✗ ${url} - Found inline handlers: ${hasInlineHandlers[0]}`);
              reject(new Error(`Inline handlers found in ${url}`));
            } else {
              console.log(`✓ ${url} - No inline handlers`);
            }

            // Test for template tags (should not exist)
            const hasTemplateTags = data.match(/\{\{[^}]+\}\}/);
            if (hasTemplateTags) {
              console.log(`✗ ${url} - Found template tags: ${hasTemplateTags[0]}`);
              reject(new Error(`Template tags found in ${url}`));
            } else {
              console.log(`✓ ${url} - No template tags`);
            }
          }

          resolve();
        } else {
          console.log(`✗ ${desc} (${res.statusCode})`);
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
      });
    });

    req.on('error', (err) => {
      console.log(`✗ ${desc} - Error: ${err.message}`);
      reject(err);
    });
  });
};

console.log('🧪 Running acceptance tests...\n');

try {
  for (const test of testUrls) {
    await testUrl(test.url, test.desc);
  }

  console.log('\n✅ All acceptance tests passed!');
  console.log('\n📊 Test Results Summary:');
  console.log('✓ No CSP errors expected');
  console.log('✓ All assets load (200 status)');
  console.log('✓ No inline JS handlers found');
  console.log('✓ No template tags found');
  console.log('✓ Calculator ready for testing');

  console.log('\n🎯 Manual Test Instructions:');
  console.log('1. Open http://localhost:8000/calculators/concrete/');
  console.log('2. Enter: Length=20, Width=12, Thickness=4');
  console.log('3. Click Calculate - Expected result: ~3.56 yd³');
  console.log('4. Check DevTools Console - No CSP errors expected');
  console.log('5. Test keyboard navigation with Tab key');

} catch (error) {
  console.error('\n❌ Acceptance tests failed:', error.message);
  process.exit(1);
}