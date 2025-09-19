// Input validation utilities

export function validateInput(value, type = 'text', options = {}) {
  if (value === null || value === undefined) {
    return { valid: false, message: 'Value is required' };
  }

  switch (type) {
    case 'number':
      return validateNumber(value, options);
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'text':
      return validateText(value, options);
    default:
      return { valid: true };
  }
}

export function validateNumber(value, options = {}) {
  const {
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    required = false,
    allowDecimal = true
  } = options;

  if (value === '' || value === null || value === undefined) {
    return required
      ? { valid: false, message: 'Number is required' }
      : { valid: true };
  }

  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, message: 'Must be a valid number' };
  }

  if (!allowDecimal && num % 1 !== 0) {
    return { valid: false, message: 'Must be a whole number' };
  }

  if (num < min) {
    return { valid: false, message: `Must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, message: `Must be no more than ${max}` };
  }

  return { valid: true, value: num };
}

export function validateText(value, options = {}) {
  const {
    minLength = 0,
    maxLength = Number.POSITIVE_INFINITY,
    required = false,
    pattern = null
  } = options;

  if (value === '' || value === null || value === undefined) {
    return required
      ? { valid: false, message: 'Text is required' }
      : { valid: true };
  }

  if (value.length < minLength) {
    return { valid: false, message: `Must be at least ${minLength} characters` };
  }

  if (value.length > maxLength) {
    return { valid: false, message: `Must be no more than ${maxLength} characters` };
  }

  if (pattern && !pattern.test(value)) {
    return { valid: false, message: 'Invalid format' };
  }

  return { valid: true, value };
}

export function validateEmail(value) {
  if (!value) {
    return { valid: false, message: 'Email is required' };
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(value)) {
    return { valid: false, message: 'Invalid email format' };
  }

  return { valid: true, value };
}

export function validatePhone(value) {
  if (!value) {
    return { valid: false, message: 'Phone number is required' };
  }

  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length !== 10) {
    return { valid: false, message: 'Phone must be 10 digits' };
  }

  return { valid: true, value: cleaned };
}

export function validateRequired(value) {
  if (value === '' || value === null || value === undefined) {
    return { valid: false, message: 'This field is required' };
  }
  return { valid: true };
}

export function validateRange(value, min, max) {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, message: 'Must be a number' };
  }

  if (num < min || num > max) {
    return { valid: false, message: `Must be between ${min} and ${max}` };
  }

  return { valid: true, value: num };
}