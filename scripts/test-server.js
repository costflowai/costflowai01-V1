#!/usr/bin/env node

// Simple test server to verify the site works locally
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '../..');
const distDir = join(__dirname, 'dist');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = join(distDir, filePath);

    try {
        const content = await readFile(filePath);
        const ext = extname(filePath);
        const mimeType = mimeTypes[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content);
    } catch (error) {
        res.writeHead(404);
        res.end('File not found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`🌐 Test server running at http://localhost:${port}`);
    console.log('📁 Serving from:', distDir);
    console.log('🧪 Test your deployment locally before uploading');
});