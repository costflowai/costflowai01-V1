import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

function processHtmlFile(filePath, nonce) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Check for inline JavaScript (scripts without src attribute or with inline content)
  const inlineJsRegex = /<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi;
  const inlineJsMatches = content.match(inlineJsRegex);

  if (inlineJsMatches && inlineJsMatches.some(match => !match.includes('nonce='))) {
    console.error(`ERROR: Inline JavaScript found in ${filePath} without nonce:`);
    inlineJsMatches.forEach(match => {
      if (!match.includes('nonce=')) {
        console.error(`  ${match.trim()}`);
      }
    });
    process.exit(1);
  }

  // Inject nonce into script tags that don't already have one
  content = content.replace(
    /<script(?![^>]*nonce=)([^>]*?)>/gi,
    `<script$1 nonce="${nonce}">`
  );

  // Replace CSP nonce placeholder in netlify.toml style headers if present in HTML
  content = content.replace(/{%NONCE%}/g, nonce);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Processed ${path.relative(projectRoot, filePath)} with nonce: ${nonce}`);
}

function findHtmlFiles(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(dir);
  return files;
}

function main() {
  console.log('🔒 Starting nonce injection process...');

  const nonce = generateNonce();
  const htmlFiles = findHtmlFiles(projectRoot);

  if (htmlFiles.length === 0) {
    console.log('⚠️  No HTML files found to process');
    return;
  }

  console.log(`📝 Found ${htmlFiles.length} HTML file(s) to process`);

  htmlFiles.forEach(file => {
    processHtmlFile(file, nonce);
  });

  // Update netlify.toml with the nonce
  const netlifyTomlPath = path.join(projectRoot, 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    let netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
    netlifyConfig = netlifyConfig.replace(/{%NONCE%}/g, nonce);
    fs.writeFileSync(netlifyTomlPath, netlifyConfig, 'utf8');
    console.log(`✓ Updated netlify.toml with nonce: ${nonce}`);
  }

  console.log('✅ Nonce injection completed successfully');
}

main();