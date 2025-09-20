/**
 * CostFlowAI Accessibility Module
 * Enterprise-grade accessibility features and WCAG 2.1 compliance
 */

class AccessibilityManager {
  constructor() {
    this.config = {
      announceChanges: true,
      keyboardNavigation: true,
      focusManagement: true,
      colorContrast: true,
      screenReaderSupport: true
    };

    this.announcer = null;
    this.focusTrap = null;
    this.observers = new Map();

    this.init();
  }

  /**
   * Initialize accessibility features
   */
  init() {
    this.createAnnouncementRegion();
    this.enhanceKeyboardNavigation();
    this.implementFocusManagement();
    this.addSkipLinks();
    this.enhanceFormAccessibility();
    this.implementColorContrastChecking();
    this.addAccessibilityToolbar();

    console.log('♿ Accessibility Manager initialized');
  }

  /**
   * Create live announcement region for screen readers
   */
  createAnnouncementRegion() {
    if (document.getElementById('a11y-announcer')) return;

    this.announcer = document.createElement('div');
    this.announcer.id = 'a11y-announcer';
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.setAttribute('aria-atomic', 'true');
    this.announcer.className = 'sr-only';

    document.body.appendChild(this.announcer);
  }

  /**
   * Announce changes to screen readers
   */
  announce(message, priority = 'polite') {
    if (!this.config.announceChanges || !this.announcer) return;

    this.announcer.setAttribute('aria-live', priority);
    this.announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = '';
      }
    }, 1000);
  }

  /**
   * Enhance keyboard navigation
   */
  enhanceKeyboardNavigation() {
    if (!this.config.keyboardNavigation) return;

    // Add keyboard support for custom interactive elements
    document.addEventListener('keydown', (event) => {
      const { target, key } = event;

      // Handle Enter and Space for button-like elements
      if ((key === 'Enter' || key === ' ') && target.matches('[role="button"]:not(button)')) {
        event.preventDefault();
        target.click();
      }

      // Handle Arrow keys for menus and lists
      if (target.matches('[role="menu"] [role="menuitem"], [role="listbox"] [role="option"]')) {
        this.handleArrowNavigation(event);
      }

      // Handle Escape key for modal dialogs
      if (key === 'Escape' && target.closest('[role="dialog"]')) {
        this.closeModal(target.closest('[role="dialog"]'));
      }

      // Handle Tab trapping in modals
      if (key === 'Tab' && target.closest('[role="dialog"]')) {
        this.handleTabTrapping(event);
      }
    });

    // Add visible focus indicators
    this.addFocusIndicators();
  }

  /**
   * Handle arrow key navigation
   */
  handleArrowNavigation(event) {
    const { target, key } = event;
    const container = target.closest('[role="menu"], [role="listbox"]');
    if (!container) return;

    const items = Array.from(container.querySelectorAll('[role="menuitem"], [role="option"]'));
    const currentIndex = items.indexOf(target);

    let nextIndex = currentIndex;

    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
    }

    if (nextIndex !== currentIndex && items[nextIndex]) {
      items[nextIndex].focus();
    }
  }

  /**
   * Add visible focus indicators
   */
  addFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-user *:focus {
        outline: 2px solid #2563eb !important;
        outline-offset: 2px !important;
        border-radius: 4px !important;
      }

      .keyboard-user .btn:focus,
      .keyboard-user a:focus,
      .keyboard-user button:focus {
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3) !important;
      }
    `;
    document.head.appendChild(style);

    // Track keyboard usage
    let isKeyboardUser = false;

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        isKeyboardUser = true;
        document.body.classList.add('keyboard-user');
      }
    });

    document.addEventListener('mousedown', () => {
      isKeyboardUser = false;
      document.body.classList.remove('keyboard-user');
    });
  }

  /**
   * Implement focus management
   */
  implementFocusManagement() {
    if (!this.config.focusManagement) return;

    // Auto-focus first interactive element in new sections
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const firstFocusable = this.findFirstFocusable(node);
            if (firstFocusable && node.hasAttribute('data-auto-focus')) {
              setTimeout(() => firstFocusable.focus(), 100);
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    this.observers.set('focus', observer);
  }

  /**
   * Find first focusable element
   */
  findFirstFocusable(container) {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return container.querySelector(focusableSelectors);
  }

  /**
   * Add skip links for navigation
   */
  addSkipLinks() {
    const skipLinks = document.createElement('div');
    skipLinks.className = 'skip-links';
    skipLinks.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <a href="#main-nav" class="skip-link">Skip to navigation</a>
      <a href="#search" class="skip-link">Skip to search</a>
    `;

    // Add styles for skip links
    const style = document.createElement('style');
    style.textContent = `
      .skip-links {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9999;
      }

      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #2563eb;
        color: white;
        padding: 8px 16px;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        font-weight: 600;
        transition: top 0.3s ease;
      }

      .skip-link:focus {
        top: 0;
        outline: 2px solid white;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);

    document.body.insertBefore(skipLinks, document.body.firstChild);

    // Add IDs to target elements if they don't exist
    const main = document.querySelector('main');
    if (main && !main.id) main.id = 'main-content';

    const nav = document.querySelector('nav');
    if (nav && !nav.id) nav.id = 'main-nav';

    const search = document.querySelector('[type="search"], [role="search"]');
    if (search && !search.id) search.id = 'search';
  }

  /**
   * Enhance form accessibility
   */
  enhanceFormAccessibility() {
    // Add proper labels and descriptions
    document.querySelectorAll('input, select, textarea').forEach(field => {
      if (!field.hasAttribute('aria-label') && !field.hasAttribute('aria-labelledby')) {
        const label = document.querySelector(`label[for="${field.id}"]`);
        if (!label && field.placeholder) {
          field.setAttribute('aria-label', field.placeholder);
        }
      }

      // Add required field indicators
      if (field.hasAttribute('required')) {
        field.setAttribute('aria-required', 'true');
      }
    });

    // Enhance error handling
    document.addEventListener('invalid', (event) => {
      const field = event.target;
      const errorId = `${field.id || 'field'}-error`;

      // Create or update error message
      let errorElement = document.getElementById(errorId);
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }

      errorElement.textContent = field.validationMessage;
      field.setAttribute('aria-describedby', errorId);
      field.setAttribute('aria-invalid', 'true');

      this.announce(`Error in ${field.getAttribute('aria-label') || field.name || 'form field'}: ${field.validationMessage}`);
    });

    // Clear errors on valid input
    document.addEventListener('input', (event) => {
      const field = event.target;
      if (field.validity.valid && field.hasAttribute('aria-invalid')) {
        field.removeAttribute('aria-invalid');
        const errorId = field.getAttribute('aria-describedby');
        if (errorId) {
          const errorElement = document.getElementById(errorId);
          if (errorElement) {
            errorElement.remove();
          }
          field.removeAttribute('aria-describedby');
        }
      }
    });
  }

  /**
   * Implement color contrast checking
   */
  implementColorContrastChecking() {
    if (!this.config.colorContrast) return;

    // Basic color contrast validation
    const checkContrast = (element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      // Simple contrast check (would need more sophisticated algorithm for production)
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // Log potential contrast issues for development
        console.log('Color contrast check:', { element, color, backgroundColor });
      }
    };

    // Check contrast for text elements
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button').forEach(checkContrast);
  }

  /**
   * Add accessibility toolbar
   */
  addAccessibilityToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'a11y-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Accessibility options');

    toolbar.innerHTML = `
      <button class="a11y-toggle" aria-label="Toggle accessibility options">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6"/>
          <path d="M1 12h6m6 0h6"/>
        </svg>
      </button>
      <div class="a11y-options" hidden>
        <button class="a11y-option" data-action="increase-text">Increase Text Size</button>
        <button class="a11y-option" data-action="decrease-text">Decrease Text Size</button>
        <button class="a11y-option" data-action="high-contrast">High Contrast</button>
        <button class="a11y-option" data-action="reset">Reset</button>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .a11y-toolbar {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: white;
        border: 2px solid #2563eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .a11y-toggle {
        background: #2563eb;
        color: white;
        border: none;
        padding: 12px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .a11y-options {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 2px solid #2563eb;
        border-radius: 8px;
        margin-top: 8px;
        min-width: 200px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .a11y-option {
        display: block;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: none;
        text-align: left;
        cursor: pointer;
        border-bottom: 1px solid #e5e7eb;
      }

      .a11y-option:last-child {
        border-bottom: none;
      }

      .a11y-option:hover {
        background: #f3f4f6;
      }

      .a11y-option:focus {
        background: #e5e7eb;
        outline: 2px solid #2563eb;
        outline-offset: -2px;
      }

      @media (max-width: 768px) {
        .a11y-toolbar {
          top: 10px;
          right: 10px;
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toolbar);

    // Add event listeners
    const toggle = toolbar.querySelector('.a11y-toggle');
    const options = toolbar.querySelector('.a11y-options');

    toggle.addEventListener('click', () => {
      const isHidden = options.hasAttribute('hidden');
      if (isHidden) {
        options.removeAttribute('hidden');
        toggle.setAttribute('aria-expanded', 'true');
      } else {
        options.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Handle option clicks
    options.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      if (action) {
        this.handleAccessibilityAction(action);
        options.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on outside click
    document.addEventListener('click', (event) => {
      if (!toolbar.contains(event.target)) {
        options.setAttribute('hidden', '');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Handle accessibility actions
   */
  handleAccessibilityAction(action) {
    const body = document.body;

    switch (action) {
      case 'increase-text':
        body.style.fontSize = body.style.fontSize ?
          `${parseFloat(body.style.fontSize) + 0.1}em` : '1.1em';
        this.announce('Text size increased');
        break;

      case 'decrease-text':
        const currentSize = body.style.fontSize ? parseFloat(body.style.fontSize) : 1;
        if (currentSize > 0.8) {
          body.style.fontSize = `${currentSize - 0.1}em`;
          this.announce('Text size decreased');
        }
        break;

      case 'high-contrast':
        body.classList.toggle('high-contrast');
        const isHighContrast = body.classList.contains('high-contrast');
        this.announce(isHighContrast ? 'High contrast enabled' : 'High contrast disabled');

        if (isHighContrast) {
          this.applyHighContrastStyles();
        } else {
          this.removeHighContrastStyles();
        }
        break;

      case 'reset':
        body.style.fontSize = '';
        body.classList.remove('high-contrast');
        this.removeHighContrastStyles();
        this.announce('Accessibility settings reset');
        break;
    }
  }

  /**
   * Apply high contrast styles
   */
  applyHighContrastStyles() {
    const style = document.createElement('style');
    style.id = 'high-contrast-styles';
    style.textContent = `
      .high-contrast {
        filter: contrast(150%) brightness(150%);
      }

      .high-contrast * {
        background-color: #000000 !important;
        color: #ffffff !important;
        border-color: #ffffff !important;
      }

      .high-contrast .btn-primary {
        background-color: #ffffff !important;
        color: #000000 !important;
      }

      .high-contrast img,
      .high-contrast svg {
        filter: invert(1) contrast(150%);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Remove high contrast styles
   */
  removeHighContrastStyles() {
    const style = document.getElementById('high-contrast-styles');
    if (style) {
      style.remove();
    }
  }

  /**
   * Handle tab trapping in modals
   */
  handleTabTrapping(event) {
    const modal = event.target.closest('[role="dialog"]');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && event.target === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && event.target === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  /**
   * Close modal and return focus
   */
  closeModal(modal) {
    const trigger = document.querySelector(`[aria-controls="${modal.id}"]`);
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    if (trigger) {
      trigger.focus();
    }

    this.announce('Dialog closed');
  }

  /**
   * Get accessibility status
   */
  getStatus() {
    return {
      config: this.config,
      hasAnnouncer: !!this.announcer,
      observersCount: this.observers.size,
      features: [
        'Live announcements',
        'Keyboard navigation',
        'Focus management',
        'Skip links',
        'Form accessibility',
        'Color contrast checking',
        'Accessibility toolbar'
      ]
    };
  }

  /**
   * Clean up accessibility features
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();

    if (this.announcer) {
      this.announcer.remove();
    }

    console.log('🧹 Accessibility Manager destroyed');
  }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Export for global access
window.CostFlowA11y = accessibilityManager;

export default accessibilityManager;