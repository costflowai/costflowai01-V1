/**
 * CostFlowAI Analytics Module
 * Comprehensive analytics tracking for construction cost calculation platform
 */

class AnalyticsManager {
  constructor() {
    this.config = {
      enabled: false,
      trackingId: null,
      dataLayer: [],
      consentGiven: false,
      debug: false
    };
    
    this.events = {
      CALCULATOR_LOAD: 'calculator_load',
      CALCULATOR_CALCULATE: 'calculator_calculate', 
      CALCULATOR_EXPORT: 'calculator_export',
      SEARCH_QUERY: 'search_query',
      SEARCH_RESULT_CLICK: 'search_result_click',
      BLOG_POST_VIEW: 'blog_post_view',
      PAGE_VIEW: 'page_view',
      USER_ENGAGEMENT: 'user_engagement',
      CONVERSION: 'conversion'
    };

    this.init();
  }

  /**
   * Initialize analytics with privacy compliance
   */
  init() {
    // Check for consent (GDPR/privacy compliance)
    this.checkConsent();
    
    // Initialize dataLayer for GTM/GA4
    window.dataLayer = window.dataLayer || [];
    this.gtag = function() { window.dataLayer.push(arguments); };
    
    // Set default consent state
    this.gtag('consent', 'default', {
      analytics_storage: this.config.consentGiven ? 'granted' : 'denied',
      ad_storage: 'denied', // Always deny ad storage for privacy
      wait_for_update: 500
    });

    // Initialize GA4 if valid tracking ID is available
    const trackingId = this.getTrackingId();
    if (trackingId) {
      this.initializeGA4();
    } else {
      console.log('🔍 Analytics disabled - no valid tracking ID configured');
    }

    // Set up enhanced measurements
    this.setupEnhancedMeasurements();
    
    console.log('🔍 Analytics Manager initialized', {
      enabled: this.config.enabled,
      consent: this.config.consentGiven,
      trackingId: this.config.trackingId ? 'configured' : 'pending'
    });
  }

  /**
   * Get tracking ID from environment or meta tag
   */
  getTrackingId() {
    // Check for tracking ID in meta tag
    const metaTag = document.querySelector('meta[name="ga-tracking-id"]');
    if (metaTag) {
      const trackingId = metaTag.getAttribute('content');
      if (trackingId && trackingId !== 'G-PLACEHOLDER123') {
        this.config.trackingId = trackingId;
        return this.config.trackingId;
      }
    }

    // Check for environment variable (development)
    if (typeof ANALYTICS_ID !== 'undefined' && ANALYTICS_ID !== 'G-PLACEHOLDER123') {
      this.config.trackingId = ANALYTICS_ID;
      return this.config.trackingId;
    }

    // No valid tracking ID found - disable analytics in development
    console.warn('🔍 No valid GA4 tracking ID found. Set GA4_TRACKING_ID environment variable or update meta tag for production.');
    return null;
  }

  /**
   * Initialize Google Analytics 4
   */
  initializeGA4() {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
    
    // Apply CSP nonce if available
    const existingScript = document.querySelector('script[nonce]');
    if (existingScript) {
      script.nonce = existingScript.getAttribute('nonce');
    }

    document.head.appendChild(script);

    // Configure GA4 (defer page_view until consent granted)
    this.gtag('js', new Date());
    this.gtag('config', this.config.trackingId, {
      page_title: document.title,
      page_location: window.location.href,
      anonymize_ip: true, // Privacy compliance
      allow_google_signals: false, // Disable advertising features
      send_page_view: false // Defer until consent granted
    });

    // Send initial page_view only if consent already granted
    if (this.config.consentGiven) {
      this.trackPageView();
    }

    this.config.enabled = true;
    window.gtag = this.gtag; // Make gtag globally available

    console.log('✅ Google Analytics 4 initialized:', this.config.trackingId);
  }

  /**
   * Check and manage user consent
   */
  checkConsent() {
    // Check for existing consent preference
    const consent = localStorage.getItem('analytics-consent');
    
    if (consent === 'granted') {
      this.config.consentGiven = true;
    } else if (consent === 'denied') {
      this.config.consentGiven = false;
    } else {
      // No consent given yet, default to denied for privacy
      this.config.consentGiven = false;
      this.showConsentBanner();
    }
  }

  /**
   * Show privacy-compliant consent banner
   */
  showConsentBanner() {
    // Only show if no consent decision has been made
    if (localStorage.getItem('analytics-consent')) return;

    const banner = document.createElement('div');
    banner.className = 'analytics-consent-banner';
    banner.innerHTML = `
      <div class="consent-content">
        <p>We use analytics to improve your experience and understand how our calculators help construction professionals.</p>
        <div class="consent-actions">
          <button id="consent-accept" class="btn btn-primary">Accept Analytics</button>
          <button id="consent-decline" class="btn btn-secondary">Decline</button>
          <a href="/privacy" class="consent-link">Privacy Policy</a>
        </div>
      </div>
    `;

    // Add CSS for the banner
    const style = document.createElement('style');
    style.textContent = `
      .analytics-consent-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        border-top: 2px solid #1e40af;
        padding: 1rem;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        font-size: 0.9rem;
      }
      
      .consent-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      
      .consent-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      .consent-link {
        color: #6b7280;
        text-decoration: underline;
        font-size: 0.85rem;
      }

      @media (max-width: 768px) {
        .consent-content {
          flex-direction: column;
          text-align: center;
        }
        
        .consent-actions {
          flex-wrap: wrap;
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Handle consent decisions
    document.getElementById('consent-accept').addEventListener('click', () => {
      this.grantConsent();
      banner.remove();
    });

    document.getElementById('consent-decline').addEventListener('click', () => {
      this.denyConsent();
      banner.remove();
    });
  }

  /**
   * Grant analytics consent
   */
  grantConsent() {
    localStorage.setItem('analytics-consent', 'granted');
    this.config.consentGiven = true;
    
    // Update consent for GA4
    if (window.gtag) {
      this.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }

    // Initialize GA4 if not already done and valid tracking ID exists
    if (!this.config.enabled && this.config.trackingId) {
      this.initializeGA4();
    }

    // Send initial page view on consent grant
    this.trackPageView();

    console.log('✅ Analytics consent granted');
  }

  /**
   * Deny analytics consent
   */
  denyConsent() {
    localStorage.setItem('analytics-consent', 'denied');
    this.config.consentGiven = false;
    
    // Update consent for GA4
    if (window.gtag) {
      this.gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    console.log('❌ Analytics consent denied');
  }

  /**
   * Setup enhanced measurement tracking
   */
  setupEnhancedMeasurements() {
    // Track calculator interactions
    this.setupCalculatorTracking();
    
    // Track search interactions
    this.setupSearchTracking();
    
    // Track scroll depth
    this.setupScrollTracking();
    
    // Track file downloads
    this.setupDownloadTracking();
    
    // Track external link clicks
    this.setupExternalLinkTracking();
  }

  /**
   * Track calculator usage and conversions
   */
  setupCalculatorTracking() {
    // Listen for calculator events
    document.addEventListener('calculator:loaded', (event) => {
      this.trackEvent(this.events.CALCULATOR_LOAD, {
        calculator_type: event.detail.type,
        calculator_name: event.detail.name
      });
    });

    document.addEventListener('calculator:calculated', (event) => {
      this.trackEvent(this.events.CALCULATOR_CALCULATE, {
        calculator_type: event.detail.type,
        calculator_name: event.detail.name,
        input_count: event.detail.inputCount,
        value: event.detail.totalCost // For conversion tracking
      });
    });

    document.addEventListener('calculator:exported', (event) => {
      this.trackEvent(this.events.CALCULATOR_EXPORT, {
        calculator_type: event.detail.type,
        export_format: event.detail.format,
        value: event.detail.totalCost
      });
      
      // Track as conversion
      this.trackConversion('calculator_export', event.detail.totalCost);
    });
  }

  /**
   * Track search interactions
   */
  setupSearchTracking() {
    // Search queries
    document.addEventListener('search:query', (event) => {
      this.trackEvent(this.events.SEARCH_QUERY, {
        search_term: event.detail.query,
        results_count: event.detail.resultsCount
      });
    });

    // Search result clicks
    document.addEventListener('search:result-click', (event) => {
      this.trackEvent(this.events.SEARCH_RESULT_CLICK, {
        search_term: event.detail.query,
        result_url: event.detail.url,
        result_type: event.detail.type
      });
    });
  }

  /**
   * Track scroll depth for engagement
   */
  setupScrollTracking() {
    let maxScroll = 0;
    const milestones = [25, 50, 75, 90];
    const tracked = new Set();

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      milestones.forEach(milestone => {
        if (maxScroll >= milestone && !tracked.has(milestone)) {
          tracked.add(milestone);
          this.trackEvent('scroll_depth', {
            scroll_depth: milestone,
            page_title: document.title
          });
        }
      });
    });
  }

  /**
   * Track file downloads
   */
  setupDownloadTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.href;
      const downloadExtensions = ['.pdf', '.xlsx', '.csv', '.json', '.zip'];
      
      if (downloadExtensions.some(ext => href.includes(ext))) {
        this.trackEvent('file_download', {
          file_url: href,
          file_type: href.split('.').pop(),
          link_text: link.textContent.trim()
        });
      }
    });
  }

  /**
   * Track external link clicks
   */
  setupExternalLinkTracking() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.href;
      if (href && !href.startsWith(window.location.origin) && href.startsWith('http')) {
        this.trackEvent('external_link_click', {
          external_url: href,
          link_text: link.textContent.trim()
        });
      }
    });
  }

  /**
   * Track custom events
   */
  trackEvent(eventName, parameters = {}) {
    if (!this.config.enabled || !this.config.consentGiven) {
      if (this.config.debug) {
        console.log('🔍 Analytics event (consent denied):', eventName, parameters);
      }
      return;
    }

    // Add common parameters
    const eventData = {
      ...parameters,
      timestamp: Date.now(),
      page_title: document.title,
      page_location: window.location.href
    };

    // Send to GA4
    if (window.gtag) {
      this.gtag('event', eventName, eventData);
    }

    if (this.config.debug) {
      console.log('🔍 Analytics event tracked:', eventName, eventData);
    }
  }

  /**
   * Track conversions (calculator usage)
   */
  trackConversion(conversionType, value = 0) {
    if (!this.config.enabled || !this.config.consentGiven) return;

    this.trackEvent(this.events.CONVERSION, {
      conversion_type: conversionType,
      value: value,
      currency: 'USD'
    });

    // Track as GA4 conversion
    if (window.gtag) {
      this.gtag('event', 'conversion', {
        send_to: this.config.trackingId,
        value: value,
        currency: 'USD'
      });
    }
  }

  /**
   * Track page views manually
   */
  trackPageView(page = null) {
    if (!this.config.enabled || !this.config.consentGiven) return;

    const pageData = {
      page_title: document.title,
      page_location: page || window.location.href
    };

    if (window.gtag) {
      this.gtag('config', this.config.trackingId, pageData);
    }
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.config.debug = true;
    console.log('🔍 Analytics debug mode enabled');
  }

  /**
   * Get analytics status
   */
  getStatus() {
    return {
      enabled: this.config.enabled,
      consentGiven: this.config.consentGiven,
      trackingId: this.config.trackingId,
      debug: this.config.debug
    };
  }
}

// Initialize analytics manager
const analytics = new AnalyticsManager();

// Export for global access
window.CostFlowAnalytics = analytics;

export default analytics;