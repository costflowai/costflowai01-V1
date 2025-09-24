import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateVolume,
  calculateArea,
  materials,
  pricing,
  formatters
} from '../../utils/calculatorUtils';

export default function ConcreteCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    thickness: '4'
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const calculate = (e) => {
    e.preventDefault();

    // Comprehensive validation
    const newErrors = {};

    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.thickness = validatePositiveNumber(dimensions.thickness, 'Thickness');

    // Remove null errors
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) {
        delete newErrors[key];
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Calculate using shared utilities
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const thickness = parseFloat(dimensions.thickness);

    const area = calculateArea.rectangle(length, width);
    const volumeCubicFeet = calculateVolume.cubicFeet(length, width, thickness);
    const volumeCubicYards = calculateVolume.cubicYards(volumeCubicFeet);
    const volumeWithWaste = calculateVolume.withWasteFactor(volumeCubicYards, 0.1);

    const bags80lb = materials.concrete.bags80lb(volumeCubicFeet);
    const bags60lb = materials.concrete.bags60lb(volumeCubicFeet);
    const readyMixYards = materials.concrete.readyMixYards(volumeCubicYards);

    const costReadyMix = volumeWithWaste * pricing.concrete.readyMixPerYard;
    const cost80lbBags = bags80lb * pricing.concrete.bags80lbEach;
    const cost60lbBags = bags60lb * pricing.concrete.bags60lbEach;

    const calculationResults = {
      area: formatters.area(area),
      volumeCubicFeet: formatters.volume(volumeCubicFeet, 'cu ft'),
      volumeCubicYards: formatters.volume(volumeCubicYards),
      volumeWithWaste: formatters.volume(volumeWithWaste),
      readyMixYards: formatters.volume(readyMixYards),
      bags80lb: formatters.count(bags80lb),
      bags60lb: formatters.count(bags60lb),
      costReadyMix: formatters.currency(costReadyMix),
      cost80lbBags: formatters.currency(cost80lbBags),
      cost60lbBags: formatters.currency(cost60lbBags)
    };

    setResults(calculationResults);

    // Track calculator usage for analytics
    trackCalculatorUse('concrete', { length, width, thickness });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', thickness: '4' });
    setResults(null);
    setErrors({});
  };

  return (
    <CalculatorLayout
      title="Professional Concrete Calculator"
      description="Calculate concrete volume, materials, and costs for slabs, foundations, and construction projects with industry-standard accuracy."
      results={results}
      inputs={dimensions}
      calculatorType="concrete"
    >
      <form onSubmit={calculate} className="calculator-form" role="form" aria-labelledby="calculator-title">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Length (feet)</label>
            <input
              type="number"
              id="length"
              step="0.1"
              min="0"
              max="10000"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              className={errors.length ? 'error' : ''}
              placeholder="e.g., 20"
              aria-describedby={errors.length ? 'length-error' : undefined}
              aria-invalid={errors.length ? 'true' : 'false'}
              aria-required="true"
            />
            {errors.length && <span className="error-message" id="length-error" role="alert">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="width">Width (feet)</label>
            <input
              type="number"
              id="width"
              step="0.1"
              min="0"
              max="10000"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              className={errors.width ? 'error' : ''}
              placeholder="e.g., 15"
              aria-describedby={errors.width ? 'width-error' : undefined}
              aria-invalid={errors.width ? 'true' : 'false'}
              aria-required="true"
            />
            {errors.width && <span className="error-message" id="width-error" role="alert">{errors.width}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="thickness">Thickness (inches)</label>
            <input
              type="number"
              id="thickness"
              step="0.25"
              min="0"
              max="24"
              value={dimensions.thickness}
              onChange={(e) => setDimensions({...dimensions, thickness: e.target.value})}
              className={errors.thickness ? 'error' : ''}
              placeholder="e.g., 4"
              aria-describedby={errors.thickness ? 'thickness-error' : undefined}
              aria-invalid={errors.thickness ? 'true' : 'false'}
              aria-required="true"
            />
            {errors.thickness && <span className="error-message" id="thickness-error" role="alert">{errors.thickness}</span>}
          </div>
        </div>

        <div className="button-group" role="group" aria-label="Calculator actions">
          <button type="submit" className="btn-primary" aria-describedby="calculate-help">
            Calculate
          </button>
          <button type="button" onClick={reset} className="btn-secondary" aria-label="Reset all input fields">
            Reset
          </button>
        </div>
        <div id="calculate-help" className="sr-only">
          Calculate concrete volume and cost based on entered dimensions
        </div>
      </form>

      {results && (
        <div className="results-container">
          <h2>Concrete Calculation Results</h2>

          <div className="result-grid">
            <div className="result-item">
              <span className="label">Project Area:</span>
              <span className="value">{results.area}</span>
            </div>
            <div className="result-item">
              <span className="label">Volume (Cubic Feet):</span>
              <span className="value">{results.volumeCubicFeet}</span>
            </div>
            <div className="result-item">
              <span className="label">Volume (Cubic Yards):</span>
              <span className="value">{results.volumeCubicYards}</span>
            </div>
            <div className="result-item">
              <span className="label">With 10% Waste Factor:</span>
              <span className="value">{results.volumeWithWaste}</span>
            </div>
            <div className="result-item">
              <span className="label">Ready-Mix Concrete:</span>
              <span className="value">{results.readyMixYards}</span>
            </div>
          </div>

          <h3>Material Options</h3>
          <div className="result-grid">
            <div className="result-item">
              <span className="label">80lb Bags Needed:</span>
              <span className="value">{results.bags80lb} bags</span>
            </div>
            <div className="result-item">
              <span className="label">60lb Bags Needed:</span>
              <span className="value">{results.bags60lb} bags</span>
            </div>
          </div>

          <h3>Cost Estimates</h3>
          <div className="result-grid">
            <div className="result-item highlight">
              <span className="label">Ready-Mix Cost:</span>
              <span className="value">{results.costReadyMix}</span>
            </div>
            <div className="result-item">
              <span className="label">80lb Bags Cost:</span>
              <span className="value">{results.cost80lbBags}</span>
            </div>
            <div className="result-item">
              <span className="label">60lb Bags Cost:</span>
              <span className="value">{results.cost60lbBags}</span>
            </div>
          </div>

          <div className="formula-display">
            <h3>Calculation Method</h3>
            <code>
              Volume (cu ft) = {dimensions.length} × {dimensions.width} × ({dimensions.thickness} ÷ 12)<br/>
              Volume (cu yd) = Volume (cu ft) ÷ 27<br/>
              With Waste = Volume × 1.1 (10% waste factor)<br/>
              Ready-Mix Cost = Volume with Waste × ${pricing.concrete.readyMixPerYard}/yard<br/>
              80lb Bags = Volume (cu ft) × 0.6<br/>
              60lb Bags = Volume (cu ft) × 0.8
            </code>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}