# CostFlowAI V1 Forensics Report

**Project**: costflowai01-V1
**Analysis Date**: September 2024
**Branch**: rehab/v1-forensics
**Total Files Analyzed**: 222 (excluding node_modules, .git, binaries)

## Executive Summary

🔴 **CRITICAL CONTAMINATION DETECTED**
This repository contains mixed project architectures, conflicting deployment configurations, and significant runtime blockers that prevent reliable production deployment.

**Severity**: HIGH - Requires complete rebuild from contaminated state.

## Project Structure Analysis

### Multiple Root Conflicts
- **5 different index.html roots** detected:
  - `./index.html` (36,517 bytes - main)
  - `./src/index.html`
  - `./dist/index.html`
  - `./temp-deploy/index.html`
  - `./blog/index.html` + 50+ blog index files

### Deployment Configuration Conflicts
- **netlify.toml** (Git deploy)
- **dist/_headers** (manual deploy)
- **temp-deploy/_headers** (orphaned)
- Conflicting CSP policies and caching strategies

### Framework Contamination
- **Mixed build systems**:
  - Custom build tools (`build-dist.js`, `scripts/build.js`)
  - Tool chain confusion (`tools/build_*.mjs`)
  - Multiple package managers implied
- **Module system confusion**:
  - ESM imports with `.js` extensions
  - TypeScript config present but inconsistent usage
  - Jest/Playwright test frameworks partially configured

## Critical Runtime Blockers

### 1. CSP Violations
```bash
# Found 22+ instances of inline event handlers
./calculators/*/index.html: onclick="toggleSearch()"
```

### 2. Template Token Contamination
```bash
# Found 50+ template tokens that will render literally
{{prev_post.url}}, {{next_post.title}}, etc.
```

### 3. Missing Asset Dependencies
```javascript
// Complex import chains with potential missing files:
import '/assets/js/core/ui.js'  // May not exist in dist/
import '/assets/js/core/pricing.js'  // Complex dependency tree
```

### 4. Broken Module Resolution
- Calculator init files use dynamic imports
- Module paths assume specific build output structure
- Nonce placeholders: `nonce="PLACEHOLDER_NONCE"`

## Calculator Audit

**Total Calculators Found**: 22
- ✅ **concrete**: Has HTML, JS, complex business logic
- ⚠️  **drywall**: Has HTML, missing functional JS
- ⚠️  **paint**: Has HTML, missing functional JS
- ⚠️  **insulation**: Has HTML, missing functional JS
- ❌ **18 others**: Placeholder structures only

### Concrete Calculator Analysis
- **Complexity**: HIGH - Enterprise-grade with pricing integration
- **Dependencies**: 8+ core modules required
- **State**: Functional but over-engineered for static deployment
- **Formula**: Volume calculation with waste factors
- **Business Logic**: Materials, labor, OH&P calculations

## Contamination Sources

### Replit Environment Pollution
- `.replit`, `replit.md` configuration files
- `.local/` directory with agent state files (50+ .bin files)
- Development server configurations

### Mixed Project Artifacts
- `attached_assets/` directory (unknown origin)
- `content/` directory suggesting CMS integration
- `vendor/` directory with external dependencies
- Multiple README files with different project contexts

### Build Tool Confusion
- **11 different build scripts** across tools/, scripts/, root
- **3 different CSS build strategies** (base, dist/, inline)
- **TypeScript config** but inconsistent usage
- **Playwright + Jest** testing but incomplete setup

## SEO/Legal/A11y Gaps

### SEO Issues
- **robots.txt**: Basic but present
- **sitemap.xml**: 6.2KB with comprehensive URLs
- **Meta tags**: Inconsistent across pages
- **Canonical URLs**: Missing from most pages

### Legal Compliance
- ❌ Privacy policy: Missing
- ❌ Terms of service: Missing
- ❌ Cookie policy: Missing
- ❌ Accessibility statement: Missing
- ⚠️  ROM disclaimers: Buried in complex business logic

### Accessibility Gaps
- Inconsistent label/for associations
- Missing aria-live regions for dynamic content
- Complex calculator UIs without proper focus management
- Skip links present but not consistently implemented

## Architecture Assessment

### Current State: FAILED
- **Monolithic**: Single large index.html with embedded complexity
- **Over-engineered**: Enterprise patterns for simple calculations
- **Deployment-hostile**: Requires complex build process
- **CSP-incompatible**: Inline handlers and nonces

### Required Architecture: CLEAN SLATE
- **Static-first**: Simple HTML/CSS/Vanilla JS
- **Calculator-focused**: One formula per page pattern
- **CSP-compliant**: External scripts only
- **Build-optional**: Can deploy raw files or built

## Risk Assessment

### Production Deployment Risk: 🔴 CRITICAL
- **CSP errors** will break functionality
- **Template tokens** will render as literal text
- **Missing dependencies** will cause runtime failures
- **Multiple roots** will cause routing confusion

### Development Risk: 🟡 MEDIUM
- Complex build chains slow iteration
- Mixed architectures confuse contributors
- Over-engineering makes simple changes difficult

## Recommendations

### Phase 1: QUARANTINE
1. Create clean `/src` structure
2. Migrate only essential files
3. Remove all contaminated artifacts
4. Implement single source of truth

### Phase 2: SIMPLIFY
1. Static HTML with external JS
2. One calculator = One page + One formula
3. CSP-compliant event delegation
4. Optional build for optimization only

### Phase 3: STANDARDIZE
1. Consistent calculator template
2. Shared validation and formatting utilities
3. A11y-first component patterns
4. Clean deployment configurations

## Files for Deletion/Quarantine

### Immediate Removal
- `temp-deploy/` (orphaned deployment artifacts)
- `.local/` (Replit pollution)
- `attached_assets/` (unknown origin)
- `content/` (CMS artifacts)
- `vendor/` (unclear dependencies)
- `tools/build_*.mjs` (complex build tools)
- Multiple README files

### Architecture Reset Required
- Root `index.html` (36KB complexity)
- Complex calculator implementations
- Build tool configurations
- Test configurations (until simplified)

**RECOMMENDATION**: Complete rebuild using cleaned artifacts only.