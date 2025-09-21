# Contamination Findings Report

## Mixed Project Evidence

### Replit Development Environment Pollution
**Source**: External development environment
**Risk**: High - Development configs in production
**Files**:
- `.replit` - Replit IDE configuration
- `replit.md` - Replit-specific documentation
- `.local/state/replit/agent/*.bin` - 50+ agent state files
- `.config/` - Development environment configs

**Action**: Remove all Replit-specific files

### Multiple Project Roots
**Source**: Iterative development without cleanup
**Risk**: Critical - Deployment confusion
**Evidence**:
- Root `index.html` (36KB) vs `src/index.html` vs `dist/index.html`
- Different architectures in each root
- Conflicting dependency paths

**Action**: Establish single source of truth

### Framework Mixing
**Source**: Multiple development approaches attempted
**Risk**: High - Build complexity and runtime conflicts

#### Build System Confusion:
- `build-dist.js` (simple copier)
- `scripts/build.js` (npm script)
- `tools/build_*.mjs` (complex build chain)
- Multiple CSS build strategies

#### Module System Conflicts:
- TypeScript config but inconsistent usage
- ESM imports with `.js` extensions
- Jest/Playwright configs but incomplete setup
- Mixed import/require patterns

### Unknown Origin Files
**Source**: External projects or tools
**Risk**: Medium - Unclear licensing and functionality

#### Suspicious Directories:
- `attached_assets/` - No clear ownership
- `content/` - Suggests CMS integration not in spec
- `vendor/` - External dependencies without clear sourcing

#### Orphaned Artifacts:
- `temp-deploy/` - Deployment artifacts should not be committed
- Multiple zip files in root
- Test results and reports committed

### Template System Contamination
**Source**: Static site generator or CMS
**Risk**: Critical - Runtime display failures
**Evidence**:
```html
{{prev_post.url}}
{{next_post.title}}
{{#each}}
```
**Count**: 100+ template tokens across blog files
**Action**: Remove all template syntax, replace with static HTML

### CSP Violation Sources
**Source**: Development shortcuts
**Risk**: Critical - Security policy violations
**Evidence**:
```html
onclick="toggleSearch()"
nonce="PLACEHOLDER_NONCE"
```
**Count**: 22+ inline handlers across calculator pages
**Action**: Replace with external event delegation

## Deployment Configuration Conflicts

### Multiple Deployment Strategies:
1. **Git Deploy**: `netlify.toml` with build commands
2. **Manual Deploy**: `dist/_headers` for drag-and-drop
3. **Orphaned**: `temp-deploy/_headers` (should not exist)

**Risk**: Configuration conflicts, caching issues, security policy mismatches

### Asset Path Confusion:
- Absolute paths (`/assets/...`) assume specific deployment structure
- Relative paths broken due to multiple root contexts
- Missing asset files referenced in HTML/CSS

## Calculator Implementation Contamination

### Over-Engineering Evidence:
**Concrete Calculator Dependencies**:
```javascript
import { FormBinder, setupExportHandlers } from '../core/ui.js';
import { initPricing, getConcretePricing, getRebarPricing, getLaborPricing, calculateCost } from '../core/pricing.js';
import { saveState, loadState } from '../core/store.js';
// 8+ complex dependencies for simple volume calculation
```

**Risk**:
- Runtime failures if any dependency missing
- CSP violations from dynamic imports
- Over-complexity for static site goals

### Missing Implementation:
- 18 calculator directories with HTML but no functional JS
- Placeholder content suggesting copy-paste development
- Inconsistent patterns across calculator types

## External Project References

### Code Comments and Documentation:
- Generic "CostFlowAI" branding suggests template usage
- Boilerplate comments not customized for specific project
- Documentation references features not implemented

### Dependency Confusion:
- `package.json` references suggest full-stack application
- Gray-matter, marked dependencies suggest markdown processing
- Jest/Playwright suggest testing infrastructure not used

## Security Contamination

### Nonce Management Issues:
```html
nonce="PLACEHOLDER_NONCE"
```
- Placeholder values suggest broken build process
- CSP policies assume nonce injection that doesn't occur

### Mixed Content Policies:
- Different CSP policies in netlify.toml vs _headers
- Some pages reference external CDNs not in policy
- Inconsistent security headers across deployment methods

## Cleanup Priority Matrix

### CRITICAL (Remove Immediately):
1. Template tokens in HTML files
2. Inline event handlers
3. Placeholder nonces
4. Multiple deployment configs

### HIGH (Quarantine/Simplify):
1. Over-engineered calculator implementations
2. Complex build tool chains
3. Development environment artifacts
4. Orphaned deployment files

### MEDIUM (Evaluate/Standardize):
1. Test configurations
2. Asset organization
3. Documentation consistency
4. Dependency management

**CONCLUSION**: This repository shows signs of multiple development attempts, framework experimentation, and external project mixing. A clean rebuild is necessary to achieve production-ready static site goals.