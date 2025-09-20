#!/usr/bin/env node

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🏗️  Building dist directory...');

// Ensure dist directory exists
if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
}

// Copy essential files that need to be in dist
const filesToCopy = [
    'robots.txt',
    'sitemap.xml'
];

for (const file of filesToCopy) {
    if (existsSync(file)) {
        copyFileSync(file, join('dist', file));
        console.log(`✅ Copied ${file} to dist/`);
    }
}

console.log('✅ Dist directory build complete!');