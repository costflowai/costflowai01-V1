// Calculator Core Engine
// Events, validation, and base functionality

/**
 * Initialize a calculator with common functionality
 * @param {Object} config - Calculator configuration
 * @param {Array} config.inputs - Input field configurations
 * @param {Function} config.compute - Computation function
 * @param {Array} config.outputs - Output field configurations
 */
export function initCalculator(config) {
    const { inputs, compute, outputs } = config;

    // Get form element
    const form = document.querySelector('[data-calculator-form]');
    if (!form) {
        console.error('Calculator form not found');
        return;
    }

    // Get calculate button
    const calculateBtn = form.querySelector('[data-calculate]');
    if (!calculateBtn) {
        console.error('Calculate button not found');
        return;
    }

    // Get results container
    const resultsContainer = document.querySelector('[data-results]');
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    // Setup event listeners
    calculateBtn.addEventListener('click', handleCalculate);

    // Setup Enter key handling
    form.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.type !== 'textarea') {
            e.preventDefault();
            handleCalculate();
        }
    });

    /**
     * Handle calculate button click
     */
    function handleCalculate() {
        // Validate inputs
        const inputValues = {};
        let isValid = true;

        inputs.forEach(inputConfig => {
            const input = form.querySelector(`[name="${inputConfig.name}"]`);
            if (!input) {
                console.error(`Input ${inputConfig.name} not found`);
                return;
            }

            const value = parseFloat(input.value) || 0;

            // Validation
            if (inputConfig.required && value <= 0) {
                showInputError(input, 'This field is required and must be greater than 0');
                isValid = false;
            } else if (inputConfig.min !== undefined && value < inputConfig.min) {
                showInputError(input, `Value must be at least ${inputConfig.min}`);
                isValid = false;
            } else if (inputConfig.max !== undefined && value > inputConfig.max) {
                showInputError(input, `Value must be no more than ${inputConfig.max}`);
                isValid = false;
            } else {
                clearInputError(input);
                inputValues[inputConfig.name] = value;
            }
        });

        if (!isValid) {
            announceToScreenReader('Please correct the errors in the form');
            return;
        }

        // Perform calculation
        try {
            const results = compute(inputValues);
            displayResults(results);

            // Track calculation
            if (window.gtag) {
                gtag('event', 'calculate', {
                    'event_category': 'calculator',
                    'event_label': config.name || 'unknown'
                });
            }
        } catch (error) {
            console.error('Calculation error:', error);
            showCalculationError('An error occurred during calculation. Please check your inputs.');
        }
    }

    /**
     * Display calculation results
     */
    function displayResults(results) {
        // Clear previous results
        resultsContainer.innerHTML = '';

        // Create results header
        const header = document.createElement('h3');
        header.textContent = 'Results';
        header.className = 'results-header';
        resultsContainer.appendChild(header);

        // Create results list
        const resultsList = document.createElement('div');
        resultsList.className = 'results-list';

        outputs.forEach(outputConfig => {
            const value = results[outputConfig.key];
            if (value !== undefined) {
                const resultItem = document.createElement('div');
                resultItem.className = 'result-item';

                const label = document.createElement('span');
                label.className = 'result-label';
                label.textContent = outputConfig.label;

                const valueSpan = document.createElement('span');
                valueSpan.className = 'result-value';
                valueSpan.textContent = formatValue(value, outputConfig.format);

                resultItem.appendChild(label);
                resultItem.appendChild(valueSpan);
                resultsList.appendChild(resultItem);
            }
        });

        resultsContainer.appendChild(resultsList);

        // Add disclaimer
        const disclaimer = document.createElement('p');
        disclaimer.className = 'results-disclaimer';
        disclaimer.innerHTML = '<small><em>ROM estimate - validate before procurement. See <a href="/legal/methodology.html">methodology</a> for details.</em></small>';
        resultsContainer.appendChild(disclaimer);

        // Show results container
        resultsContainer.style.display = 'block';
        resultsContainer.setAttribute('aria-live', 'polite');

        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

        // Announce completion
        announceToScreenReader('Calculation complete. Results are displayed below.');
    }

    /**
     * Format value based on type
     */
    function formatValue(value, format) {
        if (!format) return value.toString();

        switch (format.type) {
            case 'currency':
                return window.CostFlowUtils.formatCurrency(value);
            case 'number':
                return window.CostFlowUtils.formatNumber(value, format.decimals || 2);
            case 'percentage':
                return (value * 100).toFixed(1) + '%';
            default:
                return value.toString() + (format.unit || '');
        }
    }

    /**
     * Show input validation error
     */
    function showInputError(input, message) {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        // Clear existing error
        clearInputError(input);

        // Add error class
        input.classList.add('error');

        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        formGroup.appendChild(errorElement);
    }

    /**
     * Clear input validation error
     */
    function clearInputError(input) {
        input.classList.remove('error');
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup?.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }

    /**
     * Show calculation error
     */
    function showCalculationError(message) {
        resultsContainer.innerHTML = `
            <div class="error-message calculation-error">
                <h3>Calculation Error</h3>
                <p>${message}</p>
            </div>
        `;
        resultsContainer.style.display = 'block';
        announceToScreenReader('Calculation error: ' + message);
    }

    /**
     * Announce to screen readers
     */
    function announceToScreenReader(message) {
        if (window.CostFlowUtils && window.CostFlowUtils.announceToScreenReader) {
            window.CostFlowUtils.announceToScreenReader(message);
        }
    }
}