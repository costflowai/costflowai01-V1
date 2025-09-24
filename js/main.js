/**
 * CostFlowAI Main JavaScript
 * Core functionality for the website
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('CostFlowAI loaded successfully');

    // Initialize core functionality
    initializeNavigation();
    initializeSearch();
    initializeAnalytics();
    initializeAccessibility();

    // Page-specific initialization
    const path = window.location.pathname;
    if (path.includes('/calculators/') && !path.endsWith('/calculators/')) {
        initializeCalculator();
    }
});

/**
 * Navigation Enhancement
 */
function initializeNavigation() {
    // Highlight active navigation item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.startsWith(href) && href !== '/') {
            link.classList.add('active');
        } else if (href === '/' && currentPath === '/') {
            link.classList.add('active');
        }
    });

    // Mobile menu toggle (if needed)
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-links');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
        });
    }
}

/**
 * Search Functionality
 */
function initializeSearch() {
    const searchTriggers = document.querySelectorAll('.search-trigger');
    const searchOverlay = document.getElementById('search-overlay');
    const searchClose = document.getElementById('search-close');
    const searchInput = document.getElementById('blog-search');

    // Open search overlay
    searchTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            if (searchOverlay) {
                searchOverlay.style.display = 'block';
                if (searchInput) {
                    searchInput.focus();
                }
            } else {
                // Redirect to search page if overlay doesn't exist
                window.location.href = '/search/';
            }
        });
    });

    // Close search overlay
    if (searchClose) {
        searchClose.addEventListener('click', function() {
            searchOverlay.style.display = 'none';
        });
    }

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.style.display === 'block') {
            searchOverlay.style.display = 'none';
        }
    });

    // Close on outside click
    if (searchOverlay) {
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                searchOverlay.style.display = 'none';
            }
        });
    }

    // Header search functionality
    const headerSearch = document.getElementById('header-search');
    if (headerSearch) {
        let searchTimeout;

        headerSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performHeaderSearch(this.value);
            }, 300);
        });

        headerSearch.addEventListener('focus', function() {
            const dropdown = document.getElementById('search-results-dropdown');
            if (dropdown && this.value.length > 0) {
                dropdown.classList.remove('hidden');
            }
        });

        headerSearch.addEventListener('blur', function() {
            // Delay hiding to allow clicks on dropdown items
            setTimeout(() => {
                const dropdown = document.getElementById('search-results-dropdown');
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
            }, 200);
        });
    }
}

/**
 * Header Search Implementation
 */
function performHeaderSearch(query) {
    const dropdown = document.getElementById('search-results-dropdown');
    if (!dropdown || query.length < 2) {
        dropdown?.classList.add('hidden');
        return;
    }

    // Sample search data (replace with actual search implementation)
    const searchData = [
        { title: 'Concrete Calculator', url: '/calculators/concrete/', type: 'Calculator' },
        { title: 'Drywall Calculator', url: '/calculators/drywall/', type: 'Calculator' },
        { title: 'Paint Calculator', url: '/calculators/paint/', type: 'Calculator' },
        { title: 'Electrical Calculator', url: '/calculators/electrical/', type: 'Calculator' },
        { title: 'Concrete Guide', url: '/blog/concrete-calculator-guide/', type: 'Guide' },
        { title: 'Framing Guide', url: '/blog/framing-lumber-calculation-guide/', type: 'Guide' }
    ];

    const results = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="search-result">No results found</div>';
    } else {
        dropdown.innerHTML = results.map(result => `
            <div class="search-result">
                <a href="${result.url}">
                    <div class="result-title">${result.title}</div>
                    <div class="result-type">${result.type}</div>
                </a>
            </div>
        `).join('');
    }

    dropdown.classList.remove('hidden');
}

/**
 * Analytics Initialization
 */
function initializeAnalytics() {
    // Google Analytics (if tracking ID is set)
    const trackingId = document.querySelector('meta[name="ga-tracking-id"]')?.content;

    if (trackingId && trackingId !== 'G-PLACEHOLDER123') {
        // Initialize Google Analytics
        window.gtag = window.gtag || function() {
            (window.gtag.q = window.gtag.q || []).push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', trackingId);

        // Load GA script
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
        script.async = true;
        document.head.appendChild(script);
    }

    // Track calculator usage
    window.trackCalculatorUsage = function(calculatorType, action) {
        if (window.gtag) {
            window.gtag('event', action, {
                event_category: 'Calculator',
                event_label: calculatorType
            });
        }

        console.log(`Calculator event: ${calculatorType} - ${action}`);
    };

    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const formName = this.id || this.className || 'unknown';
            if (window.gtag) {
                window.gtag('event', 'form_submit', {
                    event_category: 'Form',
                    event_label: formName
                });
            }
        });
    });
}

/**
 * Accessibility Enhancements
 */
function initializeAccessibility() {
    // Skip link functionality
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
        skipLink.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.focus();
                target.scrollIntoView();
            }
        });
    }

    // Keyboard navigation for dropdowns
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Ensure focus is visible
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Announce page changes for screen readers
    const pageTitle = document.title;
    if (pageTitle) {
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Page loaded: ${pageTitle}`;
        document.body.appendChild(announcement);

        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

/**
 * Calculator Page Initialization
 */
function initializeCalculator() {
    // Load calculator base functionality
    const script = document.createElement('script');
    script.src = '/calculators/calculator-base.js';
    script.onload = function() {
        console.log('Calculator base loaded');

        // Track calculator page view
        const calculatorType = getCalculatorType();
        if (calculatorType) {
            window.trackCalculatorUsage?.(calculatorType, 'page_view');
        }
    };
    document.head.appendChild(script);

    // Load calculator styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/calculators/styles.css';
    document.head.appendChild(link);
}

/**
 * Utility Functions
 */
function getCalculatorType() {
    const path = window.location.pathname;
    const match = path.match(/\/calculators\/([^\/]+)\//);
    return match ? match[1] : null;
}

/**
 * Form Enhancement
 */
function enhanceForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        // Add loading state on submit
        form.addEventListener('submit', function() {
            const submitButton = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';

                // Re-enable after 5 seconds (fallback)
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = submitButton.dataset.originalText || 'Submit';
                }, 5000);
            }
        });

        // Store original button text
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) {
            submitButton.dataset.originalText = submitButton.textContent;
        }
    });
}

/**
 * Performance Monitoring
 */
function initializePerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', function() {
        if ('performance' in window) {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;

            console.log(`⚡ Page load time: ${Math.round(loadTime)}ms`);

            // Track performance metrics
            if (window.gtag) {
                window.gtag('event', 'timing_complete', {
                    name: 'load',
                    value: Math.round(loadTime)
                });
            }
        }
    });

    // Monitor JavaScript errors
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);

        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: e.message,
                fatal: false
            });
        }
    });
}

/**
 * Service Worker Registration
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful');
                })
                .catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
}

// Initialize additional features
document.addEventListener('DOMContentLoaded', function() {
    enhanceForms();
    initializePerformanceMonitoring();
    registerServiceWorker();
});

// Export for use by other scripts
window.CostFlowAI = {
    trackCalculatorUsage: window.trackCalculatorUsage,
    getCalculatorType,
    performHeaderSearch
};