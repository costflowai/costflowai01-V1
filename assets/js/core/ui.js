// UI interaction utilities
// Form binding, results rendering, click-to-calculate

import { bus, EVENTS } from './bus.js';
import { formatCurrency, formatNumber } from './units.js';
import { validateForm, setupLiveValidation } from './validate.js';

/**
 * Form binding utilities for calculator forms
 */
export class FormBinder {
  constructor(formElement, calculatorInstance) {
    this.form = formElement;
    this.calculator = calculatorInstance;
    this.calculateButton = null;
    this.resultsContainer = null;
    this.isInitialized = false;
  }

  /**
   * Initialize form binding
   * @param {object} options - Configuration options
   */
  init(options = {}) {
    const {
      calculateButtonSelector = '[data-action="calculate"]',
      resultsSelector = '#results',
      schema = null,
      autoCalculate = false
    } = options;

    this.calculateButton = this.form.querySelector(calculateButtonSelector);
    this.resultsContainer = document.querySelector(resultsSelector);

    if (!this.calculateButton) {
      console.warn('Calculate button not found');
      return false;
    }

    // Setup validation if schema provided
    if (schema) {
      this.setupValidation(schema, autoCalculate);
    }

    // Bind calculate button
    this.calculateButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleCalculate();
    });

    // Setup form change listeners
    this.setupFormListeners();

    this.isInitialized = true;
    bus.emit(EVENTS.FORM_CHANGED, { initialized: true, form: this.form.id });

    return true;
  }

  /**
   * Setup form validation
   */
  setupValidation(schema, autoCalculate = false) {
    // Setup live validation
    setupLiveValidation(this.form, schema, (result) => {
      this.updateCalculateButton(result.valid);

      if (autoCalculate && result.valid) {
        this.handleCalculate();
      }
    });

    // Initial validation check
    const initialResult = validateForm(this.form, schema);
    this.updateCalculateButton(initialResult.valid);
  }

  /**
   * Setup form input listeners
   */
  setupFormListeners() {
    const inputs = this.form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        bus.emit(EVENTS.FORM_CHANGED, {
          field: input.name || input.id,
          value: input.value,
          form: this.form.id
        });
      });

      input.addEventListener('change', () => {
        bus.emit(EVENTS.FORM_CHANGED, {
          field: input.name || input.id,
          value: input.value,
          form: this.form.id,
          committed: true
        });
      });
    });
  }

  /**
   * Update calculate button state
   */
  updateCalculateButton(isValid) {
    if (this.calculateButton) {
      this.calculateButton.disabled = !isValid;
      this.calculateButton.classList.toggle('disabled', !isValid);
    }
  }

  /**
   * Handle calculate button click
   */
  async handleCalculate() {
    if (!this.calculator || typeof this.calculator.calculate !== 'function') {
      console.error('Calculator instance not properly configured');
      return;
    }

    try {
      // Get form data
      const formData = this.getFormData();

      // Emit calculation started event
      bus.emit(EVENTS.CALCULATOR_CALCULATED, { started: true, data: formData });

      // Perform calculation
      const results = await this.calculator.calculate(formData);

      // Render results
      if (this.resultsContainer) {
        this.renderResults(results);
      }

      // Emit calculation completed event
      bus.emit(EVENTS.CALCULATOR_CALCULATED, {
        completed: true,
        data: formData,
        results
      });

    } catch (error) {
      console.error('Calculation error:', error);
      this.showError(error.message);

      bus.emit(EVENTS.CALCULATOR_CALCULATED, {
        error: true,
        message: error.message
      });
    }
  }

  /**
   * Get form data as object
   */
  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    // Convert FormData to plain object
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Include non-form elements
    const inputs = this.form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      const key = input.name || input.id;
      if (key && !data.hasOwnProperty(key)) {
        data[key] = input.value;
      }
    });

    return data;
  }

  /**
   * Render calculation results
   */
  renderResults(results) {
    if (!this.resultsContainer) return;

    const html = this.buildResultsHTML(results);
    this.resultsContainer.innerHTML = html;
    this.resultsContainer.classList.add('visible');

    bus.emit(EVENTS.RESULTS_UPDATED, { results });
  }

  /**
   * Build results HTML
   */
  buildResultsHTML(results) {
    const sections = [];

    // Main calculations
    if (results.calculations) {
      sections.push(`
        <div class="results-section">
          <h3>Calculations</h3>
          <div class="calculation-grid">
            ${this.buildCalculationItems(results.calculations)}
          </div>
        </div>
      `);
    }

    // Materials breakdown
    if (results.materials) {
      sections.push(`
        <div class="results-section">
          <h3>Materials</h3>
          <div class="materials-list">
            ${this.buildMaterialsList(results.materials)}
          </div>
        </div>
      `);
    }

    // Cost breakdown
    if (results.costs) {
      sections.push(`
        <div class="results-section">
          <h3>Cost Breakdown</h3>
          <div class="cost-breakdown">
            ${this.buildCostBreakdown(results.costs)}
          </div>
        </div>
      `);
    }

    // Export actions
    sections.push(`
      <div class="results-section">
        <h3>Export Results</h3>
        <div class="export-actions">
          <button data-action="export" data-format="csv" class="btn-secondary">CSV</button>
          <button data-action="export" data-format="xlsx" class="btn-secondary">Excel</button>
          <button data-action="export" data-format="pdf" class="btn-secondary">PDF</button>
          <button data-action="print" class="btn-secondary">Print</button>
          <button data-action="save" class="btn-secondary">Save</button>
          <button data-action="email" class="btn-secondary">Email</button>
        </div>
      </div>
    `);

    return sections.join('');
  }

  /**
   * Build calculation items
   */
  buildCalculationItems(calculations) {
    return Object.entries(calculations).map(([key, value]) => {
      const label = this.formatLabel(key);
      const formattedValue = this.formatValue(value);

      return `
        <div class="calculation-item">
          <span class="calculation-label">${label}</span>
          <span class="calculation-value">${formattedValue}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * Build materials list
   */
  buildMaterialsList(materials) {
    return materials.map(material => `
      <div class="material-item">
        <span class="material-name">${material.name}</span>
        <span class="material-quantity">${this.formatValue(material.quantity)}</span>
        <span class="material-unit">${material.unit}</span>
        <span class="material-cost">${formatCurrency(material.cost)}</span>
      </div>
    `).join('');
  }

  /**
   * Build cost breakdown
   */
  buildCostBreakdown(costs) {
    const items = costs.items || [];
    const total = costs.total || 0;

    const itemsHTML = items.map(item => `
      <div class="cost-item">
        <span class="cost-label">${item.label}</span>
        <span class="cost-amount">${formatCurrency(item.amount)}</span>
      </div>
    `).join('');

    return `
      ${itemsHTML}
      <div class="cost-total">
        <span class="cost-label"><strong>Total</strong></span>
        <span class="cost-amount"><strong>${formatCurrency(total)}</strong></span>
      </div>
    `;
  }

  /**
   * Format label for display
   */
  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Format value for display
   */
  formatValue(value) {
    if (typeof value === 'number') {
      if (value % 1 === 0) {
        return formatNumber(value, 0);
      }
      return formatNumber(value, 2);
    }
    return String(value);
  }

  /**
   * Show error message
   */
  showError(message) {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = `
        <div class="error-message">
          <h3>Calculation Error</h3>
          <p>${message}</p>
        </div>
      `;
      this.resultsContainer.classList.add('visible');
    }
  }
}

/**
 * Setup export handlers for results
 */
export function setupExportHandlers(calculator) {
  document.addEventListener('click', (e) => {
    const target = e.target;

    if (target.dataset.action === 'export') {
      e.preventDefault();
      const format = target.dataset.format;
      handleExport(calculator, format);
    }

    if (target.dataset.action === 'print') {
      e.preventDefault();
      handlePrint();
    }

    if (target.dataset.action === 'save') {
      e.preventDefault();
      handleSave(calculator);
    }

    if (target.dataset.action === 'email') {
      e.preventDefault();
      handleEmail(calculator);
    }
  });
}

/**
 * Handle export action
 */
async function handleExport(calculator, format) {
  if (!calculator || !calculator.getExportData) {
    console.error('Calculator does not support export');
    return;
  }

  try {
    bus.emit(EVENTS.EXPORT_STARTED, { format });

    const exportData = calculator.getExportData();

    // Dynamic import of export functions
    const { exportToCsv, exportToXlsx, exportToPdf } = await import('./export.js');

    switch (format) {
      case 'csv':
        exportToCsv(exportData.table, `${calculator.name || 'calculation'}.csv`);
        break;
      case 'xlsx':
        exportToXlsx(exportData.table, `${calculator.name || 'calculation'}.xlsx`);
        break;
      case 'pdf':
        exportToPdf(exportData.table, exportData.title, `${calculator.name || 'calculation'}.pdf`);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    bus.emit(EVENTS.EXPORT_COMPLETED, { format });

  } catch (error) {
    console.error('Export error:', error);
    bus.emit(EVENTS.EXPORT_ERROR, { format, error: error.message });
  }
}

/**
 * Handle print action
 */
async function handlePrint() {
  const resultsContainer = document.getElementById('results');
  if (resultsContainer) {
    const { printElement } = await import('./export.js');
    printElement('results');
  }
}

/**
 * Handle save action
 */
async function handleSave(calculator) {
  if (!calculator || !calculator.getState) {
    console.error('Calculator does not support state saving');
    return;
  }

  const { saveState } = await import('./store.js');
  const state = calculator.getState();
  const saved = saveState(calculator.name || 'calculation', state);

  if (saved) {
    showNotification('Calculation saved successfully');
  } else {
    showNotification('Failed to save calculation', 'error');
  }
}

/**
 * Handle email action
 */
function handleEmail(calculator) {
  if (!calculator || !calculator.getEmailData) {
    console.error('Calculator does not support email');
    return;
  }

  const emailData = calculator.getEmailData();
  const mailtoLink = `mailto:?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
  window.location.href = mailtoLink;
}

/**
 * Show notification
 */
export function showNotification(message, type = 'success', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('visible'), 10);

  // Auto remove
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, duration);
}

/**
 * Initialize UI components
 */
export function initUI() {
  // Setup global UI event listeners
  setupGlobalEventListeners();

  // Setup responsive handlers
  setupResponsiveHandlers();

  bus.emit(EVENTS.CALCULATOR_LOADED, { ui: true });
}

/**
 * Setup global event listeners
 */
function setupGlobalEventListeners() {
  // Handle data-action clicks globally
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action]');
    if (!target) return;

    const action = target.dataset.action;

    switch (action) {
      case 'calculate':
        // Handled by FormBinder
        break;
      case 'reset':
        handleReset(target);
        break;
      case 'toggle':
        handleToggle(target);
        break;
    }
  });
}

/**
 * Setup responsive handlers
 */
function setupResponsiveHandlers() {
  // Mobile menu handling, responsive table handling, etc.
  const mediaQuery = window.matchMedia('(max-width: 768px)');

  function handleMobileChange(e) {
    document.body.classList.toggle('mobile-view', e.matches);
  }

  mediaQuery.addListener(handleMobileChange);
  handleMobileChange(mediaQuery);
}

/**
 * Handle reset action
 */
async function handleReset(element) {
  const form = element.closest('form');
  if (form) {
    form.reset();

    // Clear validation errors
    const { clearValidationErrors } = await import('./validate.js');
    clearValidationErrors(form);

    // Clear results
    const resultsContainer = document.getElementById('results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '';
      resultsContainer.classList.remove('visible');
    }

    bus.emit(EVENTS.CALCULATOR_RESET, { form: form.id });
  }
}

/**
 * Handle toggle action
 */
function handleToggle(element) {
  const target = element.dataset.target;
  if (target) {
    const targetElement = document.querySelector(target);
    if (targetElement) {
      targetElement.classList.toggle('visible');
      element.classList.toggle('active');
    }
  }
}