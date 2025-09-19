# CostFlowAI - Replit Project Documentation

## Overview
CostFlowAI is a professional cost calculation and analysis platform built as a secure, SEO-optimized static website. The project provides construction cost estimation tools and analysis features through a comprehensive set of calculators and educational blog content.

**Current State**: Successfully imported from GitHub and configured for Replit environment
**Last Updated**: September 19, 2025

## Project Architecture

### Technology Stack
- **Frontend**: Static HTML/CSS/JavaScript
- **Build System**: Node.js (ESM modules)
- **Server**: Custom Node.js static file server
- **Dependencies**: marked, gray-matter (for blog generation)
- **Security**: CSP headers with nonce-based script execution

### Project Structure
```
/
├── index.html              # Main landing page
├── server.js              # Development server (Replit-specific)
├── calculators/           # Calculator pages and logic
├── blog/                  # Generated blog pages
├── assets/               # Static assets (CSS, JS, data)
├── content/              # Markdown blog content
├── templates/            # HTML templates for generation
├── tools/                # Build tools and scripts
├── tests/                # Jest and Playwright tests
└── vendor/               # Third-party libraries
```

## Recent Changes (Replit Setup)
- **September 19, 2025**: Imported from GitHub and configured for Replit
  - Added custom Node.js server (`server.js`) for development
  - Updated `package.json` dev script to use new server
  - Configured workflow to serve on port 5000 with webview output
  - Set up deployment configuration for Replit autoscale
  - All static files build successfully with security nonces

## User Preferences
- Static site architecture maintained from original setup
- Security-focused with CSP headers and nonce injection
- SEO-optimized blog generation from markdown content
- Professional construction industry focus

## Development Workflow

### Build Process
1. `npm run build:blog` - Generates blog from markdown
2. `npm run build:search` - Creates search index
3. `npm run build:calculators` - Generates calculator pages
4. `npm run build:nonce` - Injects security nonces
5. `npm run build` - Full build pipeline

### Development Server
- Runs on `0.0.0.0:5000` (Replit-configured)
- Serves static files with proper MIME types
- Handles SPA routing and directory index files
- Security headers for cache control

### Testing
- Jest for unit tests (`npm test`)
- Playwright for E2E testing (`npm run test:e2e`)
- Calculator-specific test suite available

## Key Features
- **21 Construction Calculators**: Concrete, framing, drywall, electrical, etc.
- **Blog System**: Static blog generated from markdown content
- **Search Functionality**: Full-text search across calculators and blog
- **Security**: Strict CSP with nonce-based script execution
- **SEO**: Optimized meta tags, sitemap, RSS feed
- **Regional Pricing**: US-based regional cost data

## Deployment Configuration
- **Target**: Replit Autoscale
- **Build**: `npm run build`
- **Run**: `node server.js`
- **Port**: 5000 (frontend only)

## Important Notes
- Project uses ESM modules (`"type": "module"` in package.json)
- All JavaScript execution requires security nonces
- Build process is required before serving (generates dynamic content)
- Static files are served from project root directory
- No backend API - pure static site with client-side functionality