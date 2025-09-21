#!/usr/bin/env node

// Clean Build Script for CostFlowAI
// Copies src/ to dist/ with minimal processing

import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const srcDir = path.join(projectRoot, 'src');
const distDir = path.join(projectRoot, 'dist');

/**
 * Clean and create dist directory
 */
async function cleanDist() {
    console.log('🧹 Cleaning dist directory...');

    if (fs.existsSync(distDir)) {
        await fsp.rm(distDir, { recursive: true, force: true });
    }

    await fsp.mkdir(distDir, { recursive: true });
}

/**
 * Copy directory recursively
 */
async function copyDirectory(src, dest) {
    await fsp.mkdir(dest, { recursive: true });

    const items = await fsp.readdir(src, { withFileTypes: true });

    for (const item of items) {
        const srcPath = path.join(src, item.name);
        const destPath = path.join(dest, item.name);

        if (item.isDirectory()) {
            await copyDirectory(srcPath, destPath);
        } else {
            await fsp.copyFile(srcPath, destPath);
        }
    }
}

/**
 * Create manifest.json
 */
async function createManifest() {
    console.log('📱 Creating manifest.json...');

    const manifest = {
        name: "CostFlowAI",
        short_name: "CostFlowAI",
        description: "Professional construction cost estimation tools",
        start_url: "/",
        display: "standalone",
        background_color: "#0b57d0",
        theme_color: "#0b57d0",
        icons: []
    };

    await fsp.writeFile(
        path.join(distDir, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
    );
}

/**
 * Create robots.txt
 */
async function createRobots() {
    console.log('🤖 Creating robots.txt...');

    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/

Sitemap: https://costflowai.com/sitemap.xml`;

    await fsp.writeFile(path.join(distDir, 'robots.txt'), robots);
}

/**
 * Create sitemap.xml
 */
async function createSitemap() {
    console.log('🗺️  Creating sitemap.xml...');

    const now = new Date().toISOString().split('T')[0];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://costflowai.com/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://costflowai.com/calculators/concrete/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://costflowai.com/calculators/drywall/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://costflowai.com/calculators/paint/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://costflowai.com/calculators/insulation/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://costflowai.com/blog/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://costflowai.com/legal/privacy.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://costflowai.com/legal/terms.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://costflowai.com/legal/cookies.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://costflowai.com/legal/accessibility.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://costflowai.com/legal/methodology.html</loc>
    <lastmod>${now}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;

    await fsp.writeFile(path.join(distDir, 'sitemap.xml'), sitemap);
}

/**
 * Create _headers for manual deploy
 */
async function createHeaders() {
    console.log('🔒 Creating _headers for manual deploy...');

    const headers = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=(), interest-cohort=()
  X-Content-Type-Options: nosniff
  Cross-Origin-Opener-Policy: same-origin
  Cache-Control: public, max-age=60

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/partials/*
  Cache-Control: public, max-age=3600`;

    await fsp.writeFile(path.join(distDir, '_headers'), headers);
}

/**
 * Create _redirects for 404 prevention
 */
async function createRedirects() {
    console.log('🔀 Creating _redirects...');

    const redirects = `/blog /blog/ 301!
/calculators /calculators/ 301!
/calculators/* /calculators/:splat/ 301!
/legal /legal/ 301!`;

    await fsp.writeFile(path.join(distDir, '_redirects'), redirects);
}

/**
 * Verify required files exist
 */
async function verifyBuild() {
    console.log('✅ Verifying build...');

    const requiredFiles = [
        'index.html',
        'manifest.json',
        'robots.txt',
        'sitemap.xml',
        '_headers',
        '_redirects',
        'assets/css/main.css',
        'assets/js/main.js',
        'partials/footer.html'
    ];

    const missing = [];

    for (const file of requiredFiles) {
        const filePath = path.join(distDir, file);
        if (!fs.existsSync(filePath)) {
            missing.push(file);
        }
    }

    if (missing.length > 0) {
        console.error('❌ Missing required files:');
        missing.forEach(file => console.error(`   - ${file}`));
        process.exit(1);
    }

    console.log('✅ All required files present');
}

/**
 * Main build function
 */
async function build() {
    try {
        console.log('🚀 Starting CostFlowAI build...');
        const startTime = Date.now();

        // Check if src directory exists
        if (!fs.existsSync(srcDir)) {
            console.error('❌ Source directory not found:', srcDir);
            process.exit(1);
        }

        // Clean and copy
        await cleanDist();
        console.log('📁 Copying source files...');
        await copyDirectory(srcDir, distDir);

        // Generate additional files
        await createManifest();
        await createRobots();
        await createSitemap();
        await createHeaders();
        await createRedirects();

        // Verify build
        await verifyBuild();

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log(`✅ Build completed successfully in ${duration}s`);
        console.log(`📦 Output directory: ${distDir}`);
        console.log('');
        console.log('🚀 Ready for deployment:');
        console.log('   Manual: Upload contents of dist/ folder');
        console.log('   Git: Push to connected repository');

    } catch (error) {
        console.error('❌ Build failed:', error.message);
        process.exit(1);
    }
}

// Run build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    build();
}

export { build };