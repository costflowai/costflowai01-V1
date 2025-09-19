import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createGzip } from 'zlib';
import { randomBytes } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 5000;
const HOST = '0.0.0.0';

// MIME types for common file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

// Generate a cryptographically secure nonce for CSP
function generateNonce() {
  return randomBytes(16).toString('base64');
}

// Check if content should be compressed
function shouldCompress(contentType) {
  return /^(text\/|application\/(javascript|json))/.test(contentType);
}

const server = createServer((req, res) => {
  // Generate nonce for this request
  const nonce = generateNonce();
  
  // Remove query strings for file path resolution
  const url = req.url.split('?')[0];
  let filePath = join(__dirname, url === '/' ? 'index.html' : url.substring(1));
  
  // Handle directory requests and file resolution
  if (existsSync(filePath)) {
    // If it's a directory, try to serve index.html from that directory
    if (statSync(filePath).isDirectory()) {
      const indexPath = join(filePath, 'index.html');
      if (existsSync(indexPath)) {
        filePath = indexPath;
      } else {
        // Directory exists but no index.html, show 404
        filePath = null;
      }
    }
    // If it's a file, use it as-is
  } else {
    // File doesn't exist, try adding .html extension
    const htmlPath = filePath + '.html';
    if (existsSync(htmlPath)) {
      filePath = htmlPath;
    } else {
      // Still not found, show 404
      filePath = null;
    }
  }

  // If filePath is null, serve 404
  if (!filePath) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>404 Not Found</title></head>
        <body>
          <h1>404 Not Found</h1>
          <p>The requested resource was not found.</p>
        </body>
      </html>
    `);
    return;
  }

  try {
    let content = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Replace nonce placeholders in HTML files
    if (ext === '.html') {
      let htmlContent = content.toString();
      htmlContent = htmlContent.replace(/nonce="[^"]*"/g, `nonce="${nonce}"`);
      content = Buffer.from(htmlContent);
    }
    
    // Set headers for performance and security
    res.setHeader('Content-Type', contentType);
    
    // Performance caching headers
    if (ext === '.css' || ext === '.js') {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for assets
    } else if (ext === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
    } else if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif' || ext === '.svg') {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for images
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
    }
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content Security Policy with nonce (production-secure)
    res.setHeader('Content-Security-Policy', 
      `default-src 'self'; ` +
      `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com; ` +
      `style-src 'self' 'nonce-${nonce}'; ` +
      `img-src 'self' data: https:; ` +
      `font-src 'self'; ` +
      `connect-src 'self' https://www.google-analytics.com;`
    );
    
    // Enable compression for text content
    const acceptEncoding = req.headers['accept-encoding'] || '';
    if (shouldCompress(contentType) && acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
      
      // Compress content
      const gzip = createGzip();
      res.statusCode = 200;
      gzip.pipe(res);
      gzip.end(content);
    } else {
      res.setHeader('Vary', 'Accept-Encoding');
      res.statusCode = 200;
      res.end(content);
    }
    
  } catch (error) {
    console.error('Error serving file:', filePath, error.message);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>404 Not Found</title></head>
        <body>
          <h1>404 Not Found</h1>
          <p>The requested resource was not found.</p>
        </body>
      </html>
    `);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 CostFlowAI server running at http://${HOST}:${PORT}`);
  console.log(`📁 Serving files from: ${__dirname}`);
  console.log(`🗜️  Compression enabled for text content`);
  console.log(`🔒 Security headers active with CSP`);
});