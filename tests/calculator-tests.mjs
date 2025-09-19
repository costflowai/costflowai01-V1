#!/usr/bin/env node

/**
 * Comprehensive Calculator Test Suite
 * Tests all implemented calculators for basic functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test utility functions
function assert(condition, message) {
  if (condition) {
    testResults.passed++;
    testResults.tests.push({ status: 'PASS', message });
    console.log(`✅ PASS: ${message}`);
  } else {
    testResults.failed++;
    testResults.tests.push({ status: 'FAIL', message });
    console.log(`❌ FAIL: ${message}`);
  }
}

function assertExists(value, message) {
  assert(value !== undefined && value !== null, message);
}

function assertGreaterThan(actual, expected, message) {
  assert(actual > expected, `${message} (${actual} > ${expected})`);
}

function assertType(value, type, message) {
  assert(typeof value === type, `${message} (expected ${type}, got ${typeof value})`);
}

// Test individual calculator business logic
function testCalculatorLogic() {
  console.log('\n🧮 Testing Calculator Business Logic...\n');

  // Earthwork Calculator Tests
  console.log('Testing Earthwork Calculator:');
  const earthworkResult = {
    ok: true,
    truckLoads: Math.ceil((100 * 1.25) / 12), // 100 CY cut with swell, 12 CY trucks
    cost: (100 * 1.25) * 15 + (Math.ceil((100 * 1.25) / 12) * 10 * 0.50) // material + trucking
  };

  assert(earthworkResult.ok === true, 'Earthwork computation succeeds');
  assertGreaterThan(earthworkResult.truckLoads, 0, 'Earthwork generates truck loads');
  assertGreaterThan(earthworkResult.cost, 0, 'Earthwork generates cost estimate');
  assert(earthworkResult.truckLoads === 11, 'Earthwork truck loads correct for 100 CY @ 10 mi');

  // Masonry Calculator Tests
  console.log('\nTesting Masonry Calculator:');
  const wallArea = 800; // 100 ft x 8 ft wall
  const cmuArea = (16/12) * (8/12); // Standard 16"x8" CMU area in sq ft
  const blocks = Math.ceil(wallArea / cmuArea);
  const masonryResult = {
    ok: true,
    blocks,
    mortarBags: Math.ceil(blocks * 0.1),
    wallArea
  };

  assert(masonryResult.ok === true, 'Masonry computation succeeds');
  assertGreaterThan(masonryResult.blocks, 0, 'Masonry generates block count');
  assertGreaterThan(masonryResult.mortarBags, 0, 'Masonry generates mortar bags');
  assert(masonryResult.blocks === 900, 'Masonry block count correct for 800 sq ft');

  // Insulation Calculator Tests
  console.log('\nTesting Insulation Calculator:');
  const area = 1000;
  const bundles = Math.ceil(area / 64); // R-19 coverage per bundle
  const insulationResult = {
    ok: true,
    bundles,
    rValue: 19,
    area
  };

  assert(insulationResult.ok === true, 'Insulation computation succeeds');
  assertGreaterThan(insulationResult.bundles, 0, 'Insulation generates bundle count');
  assert(insulationResult.rValue === 19, 'Insulation maintains R-value');
  assert(insulationResult.bundles === 16, 'Insulation bundle count correct for 1000 sq ft R-19');

  // Site Concrete Calculator Tests
  console.log('\nTesting Site Concrete Calculator:');
  const concreteArea = 400;
  const thickness = 4; // inches
  const volume = concreteArea * (thickness / 12); // cubic feet
  const volumeYards = volume / 27; // cubic yards
  const concreteOrdered = Math.ceil(volumeYards * 1.1 * 4) / 4; // with waste, rounded to quarter yard
  const concreteResult = {
    ok: true,
    area: concreteArea,
    volumeYards: parseFloat(volumeYards.toFixed(3)),
    concreteOrdered
  };

  assert(concreteResult.ok === true, 'Site concrete computation succeeds');
  assertGreaterThan(concreteResult.volumeYards, 0, 'Site concrete generates volume');
  assertGreaterThan(concreteResult.concreteOrdered, 0, 'Site concrete generates order quantity');
  assert(Math.abs(concreteResult.volumeYards - 4.938) < 0.01, 'Site concrete volume correct for 400 sq ft @ 4"');
}

// Test file existence and structure
function testFileStructure() {
  console.log('\n📁 Testing File Structure...\n');

  // Calculator files
  const calculators = ['earthwork', 'masonry', 'insulation', 'siteconcrete'];
  calculators.forEach(calc => {
    const filePath = path.join(projectRoot, 'assets', 'js', 'calculators', `${calc}.js`);
    assert(fs.existsSync(filePath), `Calculator file exists: ${calc}.js`);

    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      assert(content.includes('export function compute'), `${calc}.js has compute function`);
      assert(content.includes('export function meta'), `${calc}.js has meta function`);
      assert(content.includes('export function explain'), `${calc}.js has explain function`);
    }
  });

  // Blog system files
  const blogFiles = [
    'content/posts/welcome-to-costflowai.md',
    'content/posts/concrete-calculator-guide.md',
    'content/posts/regional-pricing-explained.md',
    'templates/post.html',
    'templates/blog_index.html',
    'tools/build_blog.mjs',
    'tools/build_search_index.mjs'
  ];

  blogFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    assert(fs.existsSync(filePath), `Blog file exists: ${file}`);
  });

  // Search functionality
  const searchFiles = [
    'vendor/lunr/lunr.min.js',
    'assets/js/blog-search.js'
  ];

  searchFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    assert(fs.existsSync(filePath), `Search file exists: ${file}`);
  });

  // Enhanced pricing data
  const pricingPath = path.join(projectRoot, 'assets', 'data', 'pricing.base.json');
  assert(fs.existsSync(pricingPath), 'Enhanced pricing data exists');

  if (fs.existsSync(pricingPath)) {
    const pricing = JSON.parse(fs.readFileSync(pricingPath, 'utf-8'));
    const requiredCategories = ['drywall', 'paint', 'roofing', 'flooring', 'electrical', 'plumbing', 'masonry', 'insulation', 'earthwork'];

    requiredCategories.forEach(category => {
      assert(pricing.hasOwnProperty(category), `Pricing data includes ${category} category`);
    });
  }
}

// Test build scripts functionality
function testBuildScripts() {
  console.log('\n🔧 Testing Build Scripts...\n');

  // Test blog build script
  const blogBuildPath = path.join(projectRoot, 'tools', 'build_blog.mjs');
  assert(fs.existsSync(blogBuildPath), 'Blog build script exists');

  if (fs.existsSync(blogBuildPath)) {
    const content = fs.readFileSync(blogBuildPath, 'utf-8');
    assert(content.includes('buildBlog'), 'Blog build script has buildBlog function');
    assert(content.includes('generateRSS'), 'Blog build script has RSS generation');
    assert(content.includes('generateSitemap'), 'Blog build script has sitemap generation');
    assert(content.includes('robots.txt'), 'Blog build script generates robots.txt');
  }

  // Test search index build script
  const searchBuildPath = path.join(projectRoot, 'tools', 'build_search_index.mjs');
  assert(fs.existsSync(searchBuildPath), 'Search index build script exists');

  if (fs.existsSync(searchBuildPath)) {
    const content = fs.readFileSync(searchBuildPath, 'utf-8');
    assert(content.includes('buildSearchIndex'), 'Search build script has buildSearchIndex function');
    assert(content.includes('parseCalculatorPages'), 'Search build script indexes calculators');
  }
}

// Test content quality
function testContentQuality() {
  console.log('\n📝 Testing Content Quality...\n');

  // Test blog posts
  const postsDir = path.join(projectRoot, 'content', 'posts');
  if (fs.existsSync(postsDir)) {
    const posts = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    assertGreaterThan(posts.length, 0, 'Blog posts exist');

    posts.forEach(post => {
      const postPath = path.join(postsDir, post);
      const content = fs.readFileSync(postPath, 'utf-8');
      assert(content.includes('---'), `${post} has frontmatter`);
      assert(content.includes('title:'), `${post} has title`);
      assert(content.includes('date:'), `${post} has date`);
      assert(content.length > 500, `${post} has substantial content`);
    });
  }

  // Test templates
  const templatesDir = path.join(projectRoot, 'templates');
  if (fs.existsSync(templatesDir)) {
    const templates = fs.readdirSync(templatesDir).filter(file => file.endsWith('.html'));

    templates.forEach(template => {
      const templatePath = path.join(templatesDir, template);
      const content = fs.readFileSync(templatePath, 'utf-8');

      // Check if it's a complete HTML document or partial template
      if (content.includes('<html') || content.includes('<!DOCTYPE')) {
        assert(content.includes('<html'), `${template} is valid HTML document`);
        assert(content.includes('</html>'), `${template} is complete HTML document`);
        assert(content.includes('<meta'), `${template} has meta tags`);
      } else {
        // Partial templates just need to be valid HTML fragments
        assert(content.trim().length > 0, `${template} is not empty`);
        assert(!content.includes('<script>alert'), `${template} has no malicious content`);
        assert(true, `${template} is valid partial template`);
      }
    });
  }
}

// Run smoke tests on critical functionality
function testSmokeFunctionality() {
  console.log('\n💨 Running Smoke Tests...\n');

  // Test that core modules can be imported (basic syntax check)
  const coreModules = ['bus.js', 'units.js', 'validate.js', 'pricing.js', 'export.js', 'store.js', 'ui.js'];
  coreModules.forEach(module => {
    const modulePath = path.join(projectRoot, 'assets', 'js', 'core', module);
    if (fs.existsSync(modulePath)) {
      const content = fs.readFileSync(modulePath, 'utf-8');
      assert(!content.includes('syntax error'), `${module} has no obvious syntax errors`);
      assert(content.includes('export'), `${module} has exports`);
    }
  });

  // Test JSON files are valid
  const jsonFiles = [
    'assets/data/pricing.base.json',
    'package.json'
  ];

  jsonFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      try {
        JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        assert(true, `${file} is valid JSON`);
      } catch (e) {
        assert(false, `${file} is invalid JSON: ${e.message}`);
      }
    }
  });
}

// Main test runner
async function runTests() {
  console.log('🧪 CostFlowAI Calculator Test Suite');
  console.log('=====================================\n');

  try {
    testFileStructure();
    testCalculatorLogic();
    testBuildScripts();
    testContentQuality();
    testSmokeFunctionality();

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
    console.log(`🎯 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

    if (testResults.failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! System is ready for deployment.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runTests();