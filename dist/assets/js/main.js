// CostFlowAI Main JavaScript
// CSP-compliant external event handling

document.addEventListener('DOMContentLoaded', () => {
    // Register service worker for PWA functionality
    registerServiceWorker();

    // Load footer content
    loadFooter();

    // Initialize page-specific functionality
    initPageHandlers();

    // Setup analytics if available
    initAnalytics();
});

/**
 * Load footer content from partial
 */
async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        try {
            const response = await fetch('/partials/footer.html');
            if (response.ok) {
                const footerHTML = await response.text();
                footerPlaceholder.outerHTML = footerHTML;
            }
        } catch (error) {
            console.warn('Could not load footer partial:', error);
            // Fallback footer
            footerPlaceholder.outerHTML = `
                <footer>
                    <div class="container">
                        <nav class="footer-nav">
                            <a href="/legal/privacy.html">Privacy</a> ·
                            <a href="/legal/terms.html">Terms</a> ·
                            <a href="/legal/cookies.html">Cookies</a> ·
                            <a href="/legal/accessibility.html">Accessibility</a> ·
                            <a href="/legal/methodology.html">Methodology</a>
                        </nav>
                        <p class="copyright">&copy; 2024 CostFlowAI. Professional construction estimation tools.</p>
                    </div>
                </footer>
            `;
        }
    }
}

/**
 * Initialize page-specific event handlers
 */
function initPageHandlers() {
    // Start calculating button
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
        btnStart.addEventListener('click', (e) => {
            // Track button click if analytics available
            if (window.gtag) {
                gtag('event', 'click', {
                    'event_category': 'navigation',
                    'event_label': 'start_calculating'
                });
            }
        });
    }

    // Form validation helpers
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);

        // Real-time validation
        const inputs = form.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
    });
}

/**
 * Handle form submission with validation
 */
function handleFormSubmit(e) {
    const form = e.target;
    const isValid = validateForm(form);

    if (!isValid) {
        e.preventDefault();
        announceToScreenReader('Please correct the errors in the form');
    }
}

/**
 * Validate entire form
 */
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateInput({ target: input })) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Validate individual input
 */
function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    const type = input.type;
    let isValid = true;
    let errorMessage = '';

    // Required check
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Type-specific validation
    if (value && type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
            isValid = false;
            errorMessage = 'Please enter a valid number';
        } else if (input.hasAttribute('min') && num < parseFloat(input.getAttribute('min'))) {
            isValid = false;
            errorMessage = `Value must be at least ${input.getAttribute('min')}`;
        } else if (input.hasAttribute('max') && num > parseFloat(input.getAttribute('max'))) {
            isValid = false;
            errorMessage = `Value must be no more than ${input.getAttribute('max')}`;
        }
    }

    if (value && type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    // Update UI
    updateInputValidation(input, isValid, errorMessage);

    return isValid;
}

/**
 * Update input validation UI
 */
function updateInputValidation(input, isValid, errorMessage) {
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Update input styling
    input.classList.toggle('error', !isValid);

    // Add error message if needed
    if (!isValid && errorMessage) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';

        formGroup.appendChild(errorElement);
    }
}

/**
 * Clear validation error on input
 */
function clearValidationError(e) {
    const input = e.target;
    if (input.classList.contains('error') && input.value.trim()) {
        input.classList.remove('error');
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup?.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

/**
 * Announce message to screen readers
 */
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Register service worker for PWA functionality
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New content available, show update notification
                            showUpdateNotification();
                        }
                    });
                }
            });
        } catch (error) {
            console.warn('Service Worker registration failed:', error);
        }
    }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0b57d0;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
    `;
    notification.innerHTML = `
        <p style="margin: 0 0 0.5rem 0; font-weight: 500;">Update Available</p>
        <p style="margin: 0 0 1rem 0; font-size: 0.9em;">New features and improvements are ready.</p>
        <button onclick="location.reload()" style="background: white; color: #0b57d0; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 500;">Update Now</button>
        <button onclick="this.parentElement.remove()" style="background: transparent; color: white; border: 1px solid white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">Later</button>
    `;
    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 10000);
}

/**
 * Initialize analytics if available
 */
function initAnalytics() {
    // Privacy-focused analytics implementation
    // Only track page views and calculator usage for optimization

    if (typeof gtag === 'undefined') {
        // Lightweight analytics placeholder
        window.gtag = function(command, target, config) {
            if (command === 'event') {
                console.log(`Analytics Event: ${target}`, config);

                // Track calculator usage patterns (anonymized)
                if (target === 'calculator_use') {
                    trackCalculatorUsage(config);
                }
            }
        };
    }

    // Track page view
    gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href
    });
}

/**
 * Track calculator usage for optimization (anonymized)
 */
function trackCalculatorUsage(config) {
    const usage = {
        calculator: config.calculator_type,
        timestamp: Date.now(),
        // No personal data or specific values tracked
        session_id: generateSessionId()
    };

    // Store locally for privacy (could be sent to analytics service)
    try {
        const usageHistory = JSON.parse(localStorage.getItem('costflowai_usage') || '[]');
        usageHistory.push(usage);

        // Keep only last 10 entries
        if (usageHistory.length > 10) {
            usageHistory.splice(0, usageHistory.length - 10);
        }

        localStorage.setItem('costflowai_usage', JSON.stringify(usageHistory));
    } catch (error) {
        console.warn('Could not store usage data:', error);
    }
}

/**
 * Generate anonymous session ID
 */
function generateSessionId() {
    if (!sessionStorage.getItem('costflowai_session')) {
        const sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('costflowai_session', sessionId);
    }
    return sessionStorage.getItem('costflowai_session');
}

/**
 * Utility function to format currency
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Utility function to format numbers
 */
function formatNumber(number, decimals = 2) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
}

/**
 * Export utilities for calculator modules
 */
window.CostFlowUtils = {
    formatCurrency,
    formatNumber,
    announceToScreenReader,
    validateForm,
    validateInput
};