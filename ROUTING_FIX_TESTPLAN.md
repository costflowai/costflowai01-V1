# Calculator Routing Fix - Test Plan

## 🎯 Mission: Verify All Calculator Routes Load Their Specific Tools

### Critical Success Criteria
**BLOCK ON FAIL**: Any red result stops deployment until fixed.

---

## Phase 1: Core Routing Validation ⚠️ CRITICAL

### Test 1.1: Previously Broken Calculator Routes
**Expected**: Each URL loads its dedicated calculator (not generic list)

| Calculator Route | Expected Page | Status | Notes |
|------------------|---------------|---------|-------|
| [/calculators/flooring/](https://costflowai.com/calculators/flooring/) | Flooring Calculator | ⏳ PENDING | Should load laminate/hardwood calculator |
| [/calculators/framing/](https://costflowai.com/calculators/framing/) | Framing Calculator | ⏳ PENDING | Should load stud/lumber calculator |
| [/calculators/gravel/](https://costflowai.com/calculators/gravel/) | Gravel Calculator | ⏳ PENDING | Should load tonnage calculator |
| [/calculators/fence/](https://costflowai.com/calculators/fence/) | Fence Calculator | ⏳ PENDING | Should load fencing materials calculator |
| [/calculators/excavation/](https://costflowai.com/calculators/excavation/) | Excavation Calculator | ⏳ PENDING | Should load digging/hauling calculator |
| [/calculators/roofing/](https://costflowai.com/calculators/roofing/) | Roofing Calculator | ⏳ PENDING | Should load shingle/roof calculator |
| [/calculators/insulation/](https://costflowai.com/calculators/insulation/) | Insulation Calculator | ⏳ PENDING | Should load R-value calculator |
| [/calculators/rebar/](https://costflowai.com/calculators/rebar/) | Rebar Calculator | ⏳ PENDING | Should load reinforcement calculator |

**Pass Criteria**: All 8 routes load unique calculator pages with specific tools, NOT the generic calculator list page.

### Test 1.2: Existing Calculator Routes (Regression Test)
**Expected**: Original calculators continue working

| Calculator Route | Expected Page | Status | Notes |
|------------------|---------------|---------|-------|
| [/calculators/concrete/](https://costflowai.com/calculators/concrete/) | Concrete Calculator | ⏳ PENDING | Original - should still work |
| [/calculators/asphalt/](https://costflowai.com/calculators/asphalt/) | Asphalt Calculator | ⏳ PENDING | Original - should still work |
| [/calculators/drywall/](https://costflowai.com/calculators/drywall/) | Drywall Calculator | ⏳ PENDING | Original - should still work |
| [/calculators/paint/](https://costflowai.com/calculators/paint/) | Paint Calculator | ⏳ PENDING | Original - should still work |

---

## Phase 2: PWA & Console Validation ⚠️ CRITICAL

### Test 2.1: PWA Icon Loading
**Expected**: No console errors for missing icons

| Icon Resource | Expected | Status | Notes |
|---------------|----------|---------|-------|
| `/icon-192.png` | Loads without 404 error | ⏳ PENDING | Check browser console |
| `/icon-512.png` | Loads without 404 error | ⏳ PENDING | Check browser console |
| `/favicon.ico` | Loads without 404 error | ⏳ PENDING | Check browser tab icon |

**Test Method**: Open browser developer tools → Console tab → Navigate to site → Look for 404 errors

### Test 2.2: Console Error Check
**Expected**: No console errors on any calculator page

**Test Method**: Open each calculator page with developer tools open, check console for errors.

---

## Phase 3: Blog & SEO Validation

### Test 3.1: Blog Articles Load
**Expected**: All blog articles load with proper content

| Blog Route | Expected Content | Status | Notes |
|------------|------------------|---------|-------|
| [/blog/concrete/](https://costflowai.com/blog/concrete/) | Concrete guide with calculator link | ⏳ PENDING | Full article content |
| [/blog/flooring/](https://costflowai.com/blog/flooring/) | Flooring guide with calculator link | ⏳ PENDING | Full article content |
| [/blog/framing/](https://costflowai.com/blog/framing/) | Framing guide with calculator link | ⏳ PENDING | Full article content |
| [/blog/roofing/](https://costflowai.com/blog/roofing/) | Roofing guide with calculator link | ⏳ PENDING | Full article content |

### Test 3.2: Internal Linking
**Expected**: Blog articles link to calculators and vice versa

**Test Method**:
1. Open blog article
2. Click "Open [Calculator] Calculator" button
3. Verify it opens the correct calculator
4. Check calculator pages have "Related Tools" links

---

## Phase 4: Mobile Responsiveness ⚠️ CRITICAL

### Test 4.1: Mobile Layout Check
**Expected**: All pages responsive (360px-1440px)

**Test Method**: Use browser developer tools → Device toolbar → Test various screen sizes

| Page Type | 360px (Mobile) | 768px (Tablet) | 1440px (Desktop) | Status |
|-----------|----------------|----------------|------------------|---------|
| Calculator Pages | Should be usable | Should be usable | Should be usable | ⏳ PENDING |
| Blog Articles | Should be readable | Should be readable | Should be readable | ⏳ PENDING |

---

## Phase 5: Functional Calculator Testing

### Test 5.1: Calculator Form Validation
**Expected**: Each calculator processes inputs correctly

**Sample Test** (run on 2-3 new calculators):
1. Enter invalid inputs (negative numbers, text in number fields)
2. Expected: Error messages appear
3. Enter valid inputs
4. Expected: Results calculate correctly
5. Test export functions (PDF, CSV)
6. Expected: Export works without errors

---

## Phase 6: Lighthouse Performance Validation

### Test 6.1: Lighthouse Scores
**Expected**: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95

**Test Method**:
1. Open Chrome DevTools → Lighthouse tab
2. Run audit on 2-3 new calculator pages
3. Record scores

| Page | Performance | Accessibility | Best Practices | SEO | Status |
|------|-------------|---------------|----------------|-----|---------|
| /calculators/flooring/ | Target: ≥90 | Target: ≥95 | Target: ≥95 | Target: ≥95 | ⏳ PENDING |
| /calculators/roofing/ | Target: ≥90 | Target: ≥95 | Target: ≥95 | Target: ≥95 | ⏳ PENDING |

---

## Phase 7: SEO & Sitemap Validation

### Test 7.1: Sitemap Accessibility
**Expected**: Updated sitemap includes all new pages

**Test Method**: Visit [/sitemap.xml](https://costflowai.com/sitemap.xml)

**Expected Content**:
- All 8 new calculator routes listed
- All 4 blog routes listed
- Proper XML format
- Updated timestamps (2024-09-23)

### Test 7.2: Robots.txt Check
**Test Method**: Visit [/robots.txt](https://costflowai.com/robots.txt)

**Expected Content**:
- All calculator routes explicitly allowed
- All blog routes explicitly allowed
- Build artifacts blocked (_next/, out/)

---

## 🚨 Failure Response Plan

### If Any Critical Test Fails:
1. **STOP DEPLOYMENT** immediately
2. Identify root cause
3. Apply fix
4. Re-run full test suite
5. Only proceed when ALL critical tests pass

### Common Issues & Solutions:
- **Calculator loads generic page**: Check netlify.toml redirects, verify build output structure
- **PWA icons 404**: Verify icons exist in public/ and are included in build
- **Console errors**: Check for JavaScript errors, missing imports
- **Mobile layout broken**: Review CSS media queries, test on actual devices

---

## ✅ Sign-off Checklist

**Pre-Deployment Verification**:
- [ ] All 8 broken calculator routes now load specific tools
- [ ] No PWA console errors (icons load correctly)
- [ ] Mobile responsiveness confirmed (360px-1440px)
- [ ] Blog ↔ calculator internal linking works
- [ ] Lighthouse scores meet targets (≥90/95/95/95)
- [ ] Sitemap includes all new pages
- [ ] No console errors on any page

**Post-Deployment Actions**:
- [ ] Submit updated sitemap to Google Search Console
- [ ] Monitor 404 error reports for first 24 hours
- [ ] Track calculator usage analytics
- [ ] Verify organic search pickup for blog articles

---

## 📊 Success Metrics

**Immediate (Day 1)**:
- 0 calculator routes redirect to wrong page
- 0 PWA console errors
- All calculators functional on mobile

**Short-term (Week 1)**:
- 8 new calculator pages indexed by Google
- Blog articles appear in search results
- No 404 error spikes in analytics

**Long-term (Month 1)**:
- Increased organic traffic from calculator-specific searches
- Improved user engagement (time on site, page views)
- Enhanced SEO rankings for construction calculation keywords

---

**Test Execution Date**: _To be filled during deployment testing_
**Tester**: Senior Technical Lead
**Deployment Status**: ⏳ PENDING EXECUTION