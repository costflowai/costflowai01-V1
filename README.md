# CostFlowAI

Professional cost calculation and analysis platform built as a secure, SEO-optimized static site.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm
- Netlify CLI (optional, for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd costflowai01
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📦 Build Process

The build process includes security hardening through CSP nonce injection:

- `npm run build:nonce` - Injects security nonces into all script tags
- `npm run build` - Full build pipeline (includes nonce injection)

### Security Features

- **CSP Headers**: Strict Content Security Policy with nonce-based script execution
- **No Inline JS**: Build fails if inline JavaScript without nonces is detected
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy

## 🌐 Deployment to Netlify

### Option 1: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
npm run build
netlify deploy --prod
```

### Option 2: Git Integration
1. Push your code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.` (root)
5. Deploy automatically on git push

### Environment Configuration
- Build command: `npm run build`
- Publish directory: `.`
- Node version: 18.x (recommended)

## 📁 Project Structure

```
/
├── index.html                 # Main landing page
├── calculators/              # Calculator pages (future)
│   └── index.html
├── assets/                   # Static assets
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript modules
│   └── data/                # JSON data files
├── vendor/                   # Third-party libraries
├── content/                  # Content and blog posts
├── templates/               # HTML templates
├── tools/                   # Build tools
│   └── inject_nonce.mjs     # Security nonce injection
├── tests/                   # Test files
├── netlify.toml             # Netlify configuration
├── lighthouserc.json        # Lighthouse CI config
└── package.json             # Project configuration
```

## 🔧 Development Scripts

- `npm run build` - Build for production
- `npm run build:nonce` - Inject security nonces
- `npm test` - Run test suite
- `npm run deploy` - Deploy to Netlify

## 🛡️ Security

This project implements strict security measures:

- Content Security Policy (CSP) with nonces
- No inline JavaScript execution
- Secure headers configuration
- Build-time security validation

## 📝 License

MIT License - see LICENSE file for details.