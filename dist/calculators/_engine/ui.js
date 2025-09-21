// Calculator UI Helper Functions
// Rendering helpers and ARIA-live announcements

/**
 * Create a form group with label and input
 * @param {Object} config - Field configuration
 * @returns {HTMLElement} Form group element
 */
export function createFormGroup(config) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    // Create label
    const label = document.createElement('label');
    label.setAttribute('for', config.name);
    label.textContent = config.label;
    if (config.required) {
        label.textContent += ' *';
    }

    // Create input
    const input = document.createElement('input');
    input.type = config.type || 'number';
    input.id = config.name;
    input.name = config.name;
    input.step = config.step || '0.01';
    input.min = config.min;
    input.max = config.max;
    input.placeholder = config.placeholder || '';

    if (config.required) {
        input.required = true;
    }

    if (config.value !== undefined) {
        input.value = config.value;
    }

    // Create help text if provided
    if (config.help) {
        const helpId = `${config.name}-help`;
        input.setAttribute('aria-describedby', helpId);

        const helpText = document.createElement('small');
        helpText.id = helpId;
        helpText.className = 'form-help';
        helpText.textContent = config.help;

        formGroup.appendChild(label);
        formGroup.appendChild(input);
        formGroup.appendChild(helpText);
    } else {
        formGroup.appendChild(label);
        formGroup.appendChild(input);
    }

    return formGroup;
}

/**
 * Create a select dropdown
 * @param {Object} config - Field configuration
 * @returns {HTMLElement} Form group element
 */
export function createSelectGroup(config) {
    const formGroup = document.createElement('div');
    formGroup.className = 'form-group';

    // Create label
    const label = document.createElement('label');
    label.setAttribute('for', config.name);
    label.textContent = config.label;
    if (config.required) {
        label.textContent += ' *';
    }

    // Create select
    const select = document.createElement('select');
    select.id = config.name;
    select.name = config.name;

    if (config.required) {
        select.required = true;
    }

    // Add options
    config.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        if (option.selected) {
            optionElement.selected = true;
        }
        select.appendChild(optionElement);
    });

    // Create help text if provided
    if (config.help) {
        const helpId = `${config.name}-help`;
        select.setAttribute('aria-describedby', helpId);

        const helpText = document.createElement('small');
        helpText.id = helpId;
        helpText.className = 'form-help';
        helpText.textContent = config.help;

        formGroup.appendChild(label);
        formGroup.appendChild(select);
        formGroup.appendChild(helpText);
    } else {
        formGroup.appendChild(label);
        formGroup.appendChild(select);
    }

    return formGroup;
}

/**
 * Update results display with animation
 * @param {HTMLElement} container - Results container
 * @param {Object} results - Calculation results
 * @param {Array} outputs - Output configuration
 */
export function updateResults(container, results, outputs) {
    // Fade out current results
    container.style.opacity = '0.5';

    setTimeout(() => {
        // Clear previous results
        container.innerHTML = '';

        // Create header
        const header = document.createElement('h3');
        header.textContent = 'Calculation Results';
        header.className = 'results-header';
        container.appendChild(header);

        // Create results grid
        const resultsGrid = document.createElement('div');
        resultsGrid.className = 'results-grid';

        outputs.forEach(output => {
            const value = results[output.key];
            if (value !== undefined) {
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';

                const label = document.createElement('div');
                label.className = 'result-label';
                label.textContent = output.label;

                const valueDiv = document.createElement('div');
                valueDiv.className = 'result-value';
                valueDiv.textContent = formatValue(value, output.format);

                if (output.description) {
                    const description = document.createElement('div');
                    description.className = 'result-description';
                    description.textContent = output.description;
                    resultCard.appendChild(label);
                    resultCard.appendChild(valueDiv);
                    resultCard.appendChild(description);
                } else {
                    resultCard.appendChild(label);
                    resultCard.appendChild(valueDiv);
                }

                resultsGrid.appendChild(resultCard);
            }
        });

        container.appendChild(resultsGrid);

        // Add disclaimer
        const disclaimer = document.createElement('div');
        disclaimer.className = 'results-disclaimer';
        disclaimer.innerHTML = `
            <p><em><strong>ROM Estimate Disclaimer:</strong> These calculations provide rough order of magnitude estimates for preliminary budgeting only. Always verify with professional takeoffs, current material pricing, and local conditions before making procurement decisions.</em></p>
            <p><a href="/legal/methodology.html">Learn more about our methodology</a></p>
        `;
        container.appendChild(disclaimer);

        // Show results and fade in
        container.style.display = 'block';
        container.style.opacity = '1';
        container.setAttribute('aria-live', 'polite');

        // Scroll to results
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });

    }, 150);
}

/**
 * Format value based on configuration
 * @param {number} value - Value to format
 * @param {Object} format - Format configuration
 * @returns {string} Formatted value
 */
function formatValue(value, format) {
    if (!format) return value.toString();

    switch (format.type) {
        case 'currency':
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: format.currency || 'USD',
                minimumFractionDigits: format.decimals || 2,
                maximumFractionDigits: format.decimals || 2
            }).format(value);

        case 'number':
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: format.decimals || 2,
                maximumFractionDigits: format.decimals || 2
            }).format(value);

        case 'percentage':
            return new Intl.NumberFormat('en-US', {
                style: 'percent',
                minimumFractionDigits: format.decimals || 1,
                maximumFractionDigits: format.decimals || 1
            }).format(value / 100);

        case 'unit':
            const formattedNumber = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: format.decimals || 2,
                maximumFractionDigits: format.decimals || 2
            }).format(value);
            return `${formattedNumber} ${format.unit || ''}`;

        default:
            return value.toString();
    }
}

/**
 * Show loading state
 * @param {HTMLElement} button - Calculate button
 * @param {HTMLElement} results - Results container
 */
export function showLoading(button, results) {
    button.disabled = true;
    button.textContent = 'Calculating...';

    results.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Calculating your estimate...</p>
        </div>
    `;
    results.style.display = 'block';
}

/**
 * Hide loading state
 * @param {HTMLElement} button - Calculate button
 * @param {string} originalText - Original button text
 */
export function hideLoading(button, originalText = 'Calculate') {
    button.disabled = false;
    button.textContent = originalText;
}

/**
 * Show error message
 * @param {HTMLElement} container - Error container
 * @param {string} message - Error message
 */
export function showError(container, message) {
    container.innerHTML = `
        <div class="error-message">
            <h3>Calculation Error</h3>
            <p>${message}</p>
            <p>Please check your inputs and try again.</p>
        </div>
    `;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });

    // Announce error to screen readers
    announceToScreenReader('Calculation error: ' + message);
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
export function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';

    document.body.appendChild(announcement);
    announcement.textContent = message;

    // Remove after announcement
    setTimeout(() => {
        if (document.body.contains(announcement)) {
            document.body.removeChild(announcement);
        }
    }, 1000);
}

/**
 * Setup export handlers for results
 * @param {Object} calculator - Calculator instance
 */
export function setupExportHandlers(calculator) {
    // This will be implemented later if needed
    console.log('Export handlers not yet implemented');
}