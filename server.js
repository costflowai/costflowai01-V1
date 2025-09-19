import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

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

const server = createServer((req, res) => {
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
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Set security headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.statusCode = 200;
    res.end(content);
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
});