# Analytics Setup Guide

## Setting up Google Analytics 4 for CostFlowAI

### Production Setup

1. **Create a GA4 Property**:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Create a new property for your domain
   - Copy your Measurement ID (format: G-XXXXXXXXXX)

2. **Configure Tracking ID**:
   Update the meta tag in `index.html` and all calculator pages:
   ```html
   <meta name="ga-tracking-id" content="G-YOUR-ACTUAL-ID">
   ```

3. **Environment Variable (Optional)**:
   Set `GA4_TRACKING_ID` environment variable for dynamic configuration

### Privacy Compliance

✅ **GDPR/Privacy Ready**:
- Consent banner appears on first visit
- Analytics disabled by default until consent granted
- No tracking cookies until user consent
- Ad storage permanently disabled

✅ **Tracked Events**:
- Calculator loads and calculations
- Search queries and result clicks  
- PDF/CSV/XLSX/JSON exports
- Scroll depth and engagement
- External link clicks

### Testing Analytics

1. **Development**: Uses placeholder ID, analytics disabled
2. **Production**: Verify real GA4 ID is configured
3. **Console**: Check for "Analytics Manager initialized" logs
4. **GA4 Dashboard**: Events should appear within 24-48 hours

### Conversion Goals

Set up these goals in GA4 for business insights:
- `calculator_calculate` - User performs calculation
- `calculator_export` - User exports results (high-value conversion)
- `search_query` - User searches content
- `file_download` - User downloads resources

### Notes

- Analytics gracefully degrades if GA4 unavailable
- CSP-compliant implementation with nonce handling
- Privacy-first approach with consent management
- Integrates with existing event bus system