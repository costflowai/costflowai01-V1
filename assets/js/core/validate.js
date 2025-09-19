// Input validation utilities with schema support and inline error display
import { parseMeasurement, isValidMeasurement } from './units.js';
import { bus, EVENTS } from './bus.js';

// ============= VALIDATION SCHEMA SYSTEM =============

/**
 * Validate data against a schema
 * @param {object} data - Data to validate
 * @param {object} schema - Validation schema
 * @returns {object} Validation result with errors
 */
export function validateSchema(data, schema) {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    const fieldResult = validateField(value, rules, field);

    if (!fieldResult.valid) {
      errors[field] = fieldResult.message;
      isValid = false;
    }
  }

  return { valid: isValid, errors, data };
}

/**
 * Validate a single field against rules
 */
export function validateField(value, rules, fieldName = '') {
  for (const rule of rules) {
    const result = applyValidationRule(value, rule, fieldName);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true, value };
}

/**
 * Apply a single validation rule
 */
function applyValidationRule(value, rule, fieldName) {
  const { type, ...options } = rule;

  switch (type) {
    case 'required':
      return validateRequired(value, options);
    case 'number':
      return validateNumber(value, options);
    case 'measurement':
      return validateMeasurement(value, options);
    case 'text':
      return validateText(value, options);
    case 'email':
      return validateEmail(value, options);
    case 'select':
      return validateSelect(value, options);
    case 'custom':
      return options.validator(value, options);
    default:
      return { valid: true, value };
  }
}

// ============= CORE VALIDATION FUNCTIONS =============

export function validateInput(value, type = 'text', options = {}) {
  if (value === null || value === undefined) {
    return { valid: false, message: 'Value is required' };
  }

  switch (type) {
    case 'number':
      return validateNumber(value, options);
    case 'measurement':
      return validateMeasurement(value, options);
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'text':
      return validateText(value, options);
    case 'select':
      return validateSelect(value, options);
    default:
      return { valid: true };
  }
}

export function validateNumber(value, options = {}) {
  const {
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    required = false,
    allowDecimal = true,
    message = null
  } = options;

  if (value === '' || value === null || value === undefined) {
    return required
      ? { valid: false, message: message || 'Number is required' }
      : { valid: true };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, message: message || 'Must be a valid number' };
  }

  if (!allowDecimal && num % 1 !== 0) {
    return { valid: false, message: message || 'Must be a whole number' };
  }

  if (num < min) {
    return { valid: false, message: message || `Must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, message: message || `Must be no more than ${max}` };
  }

  return { valid: true, value: num };
}

export function validateMeasurement(value, options = {}) {
  const {
    min = 0,
    max = Number.POSITIVE_INFINITY,
    required = false,
    units = 'ft',
    message = null
  } = options;

  if (value === '' || value === null || value === undefined) {
    return required
      ? { valid: false, message: message || `Measurement is required` }
      : { valid: true };
  }

  if (!isValidMeasurement(value)) {
    return { valid: false, message: message || `Invalid measurement format` };
  }

  const parsed = parseMeasurement(value);

  if (parsed < min) {
    return { valid: false, message: message || `Must be at least ${min} ${units}` };
  }

  if (parsed > max) {
    return { valid: false, message: message || `Must be no more than ${max} ${units}` };
  }

  return { valid: true, value: parsed };
}

export function validateText(value, options = {}) {
  const {
    minLength = 0,
    maxLength = Number.POSITIVE_INFINITY,
    required = false,
    pattern = null,
    message = null
  } = options;

  if (value === '' || value === null || value === undefined) {
    return required
      ? { valid: false, message: message || 'Text is required' }
      : { valid: true };
  }

  if (value.length < minLength) {
    return { valid: false, message: message || `Must be at least ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { valid: false, message: message || `Must be no more than ${maxLength} characters` };
  }

  if (pattern && !pattern.test(value)) {
    return { valid: false, message: message || 'Invalid format' };
  }

  return { valid: true, value };
}

export function validateSelect(value, options = {}) {
  const { choices = [], required = false, message = null } = options;

  if (value === '' || value === null || value === undefined) {
    return required
      ? { valid: false, message: message || 'Selection is required' }
      : { valid: true };
  }

  if (choices.length > 0 && !choices.includes(value)) {
    return { valid: false, message: message || 'Invalid selection' };
  }

  return { valid: true, value };
}

export function validateEmail(value, options = {}) {
  const { required = false, message = null } = options;

  if (!value) {
    return required
      ? { valid: false, message: message || 'Email is required' }
      : { valid: true };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    return { valid: false, message: message || 'Invalid email format' };
  }

  return { valid: true, value };
}

export function validatePhone(value, options = {}) {
  const { required = false, message = null } = options;

  if (!value) {
    return required
      ? { valid: false, message: message || 'Phone number is required' }
      : { valid: true };
  }

  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length !== 10) {
    return { valid: false, message: message || 'Phone must be 10 digits' };
  }

  return { valid: true, value: cleaned };
}

export function validateRequired(value, options = {}) {
  const { message = null } = options;

  if (value === '' || value === null || value === undefined) {
    return { valid: false, message: message || 'This field is required' };
  }
  return { valid: true };
}

export function validateRange(value, min, max, options = {}) {
  const { message = null } = options;
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, message: message || 'Must be a number' };
  }

  if (num < min || num > max) {
    return { valid: false, message: message || `Must be between ${min} and ${max}` };
  }

  return { valid: true, value: num };
}

// ============= FORM VALIDATION UTILITIES =============

/**
 * Validate form inputs and display inline errors
 * @param {HTMLFormElement|HTMLElement} form - Form element
 * @param {object} schema - Validation schema
 * @returns {object} Validation result
 */
export function validateForm(form, schema) {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Add non-form data (like from input elements)
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.name) {
      data[input.name] = input.value;
    } else if (input.id) {
      data[input.id] = input.value;
    }
  });

  const result = validateSchema(data, schema);

  // Display inline errors
  displayValidationErrors(form, result.errors);

  // Emit validation event
  bus.emit(EVENTS.FORM_VALIDATED, { valid: result.valid, errors: result.errors, data: result.data });

  return result;
}

/**
 * Display validation errors inline
 */
export function displayValidationErrors(container, errors) {
  // Clear existing errors
  clearValidationErrors(container);

  // Display new errors
  for (const [field, message] of Object.entries(errors)) {
    const input = container.querySelector(`#${field}, [name="${field}"]`);
    if (input) {
      showFieldError(input, message);
    }
  }
}

/**
 * Clear all validation errors
 */
export function clearValidationErrors(container) {
  const errorElements = container.querySelectorAll('.validation-error');
  errorElements.forEach(el => el.remove());

  const inputsWithErrors = container.querySelectorAll('.input-error');
  inputsWithErrors.forEach(input => {
    input.classList.remove('input-error');
  });
}

/**
 * Show error for a specific field
 */
export function showFieldError(input, message) {
  input.classList.add('input-error');

  const errorElement = document.createElement('div');
  errorElement.className = 'validation-error';
  errorElement.textContent = message;

  // Insert error message after the input
  input.parentNode.insertBefore(errorElement, input.nextSibling);
}

/**
 * Clear error for a specific field
 */
export function clearFieldError(input) {
  input.classList.remove('input-error');

  const errorElement = input.parentNode.querySelector('.validation-error');
  if (errorElement) {
    errorElement.remove();
  }
}

// ============= LIVE VALIDATION =============

/**
 * Setup live validation for a form
 * @param {HTMLElement} form - Form element
 * @param {object} schema - Validation schema
 * @param {function} callback - Callback when validation changes
 */
export function setupLiveValidation(form, schema, callback = null) {
  const inputs = form.querySelectorAll('input, select, textarea');

  inputs.forEach(input => {
    const fieldName = input.name || input.id;
    const fieldRules = schema[fieldName];

    if (fieldRules) {
      // Validate on blur
      input.addEventListener('blur', () => {
        const result = validateField(input.value, fieldRules, fieldName);
        if (result.valid) {
          clearFieldError(input);
        } else {
          showFieldError(input, result.message);
        }

        if (callback) {
          const formResult = validateForm(form, schema);
          callback(formResult);
        }
      });

      // Clear errors on input
      input.addEventListener('input', () => {
        if (input.classList.contains('input-error')) {
          clearFieldError(input);
        }

        if (callback) {
          // Debounce validation
          clearTimeout(input._validationTimeout);
          input._validationTimeout = setTimeout(() => {
            const formResult = validateForm(form, schema);
            callback(formResult);
          }, 300);
        }
      });
    }
  });
}

// ============= COMMON VALIDATION SCHEMAS =============

export const COMMON_SCHEMAS = {
  CONCRETE_SLAB: {
    length: [
      { type: 'required' },
      { type: 'measurement', min: 0.1, max: 1000, units: 'ft' }
    ],
    width: [
      { type: 'required' },
      { type: 'measurement', min: 0.1, max: 1000, units: 'ft' }
    ],
    thickness: [
      { type: 'required' },
      { type: 'number', min: 0.5, max: 24, units: 'in' }
    ],
    waste: [
      { type: 'number', min: 0, max: 50, message: 'Waste must be between 0-50%' }
    ],
    rebarGrid: [
      { type: 'select', choices: ['12', '18', '24'] }
    ]
  }
};