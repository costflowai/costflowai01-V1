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

export default function AsphaltCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    thickness: '2'
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const calculate = (e) => {
    e.preventDefault();

    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.thickness = validatePositiveNumber(dimensions.thickness, 'Thickness');

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

    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const thickness = parseFloat(dimensions.thickness);

    const area = calculateArea.rectangle(length, width);
    const volumeCubicFeet = calculateVolume.cubicFeet(length, width, thickness);
    const tonnage = materials.asphalt.tonnage(volumeCubicFeet);
    const tonnageWithWaste = tonnage * 1.1; // 10% waste factor

    const materialCost = tonnageWithWaste * pricing.asphalt.tonnageEach;

    const calculationResults = {
      area: formatters.area(area),
      volumeCubicFeet: formatters.volume(volumeCubicFeet, 'cu ft'),
      tonnage: `${tonnage.toFixed(2)} tons`,
      tonnageWithWaste: `${tonnageWithWaste.toFixed(2)} tons`,
      materialCost: formatters.currency(materialCost)
    };

    setResults(calculationResults);
    trackCalculatorUse('asphalt', { length, width, thickness });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', thickness: '2' });
    setResults(null);
    setErrors({});
  };

  return (
    <CalculatorLayout
      title="Professional Asphalt Calculator"
      description="Calculate asphalt tonnage and costs for driveways, parking lots, and paving projects."
      results={results}
      inputs={dimensions}
      calculatorType="asphalt"
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
              placeholder="e.g., 50"
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
              placeholder="e.g., 12"
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
              max="12"
              value={dimensions.thickness}
              onChange={(e) => setDimensions({...dimensions, thickness: e.target.value})}
              className={errors.thickness ? 'error' : ''}
              placeholder="e.g., 2"
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
          Calculate asphalt tonnage and costs based on project dimensions
        </div>
      </form>

      {results && (
        <div className="results-container">
          <h2>Asphalt Calculation Results</h2>

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
              <span className="label">Asphalt Needed:</span>
              <span className="value">{results.tonnage}</span>
            </div>
            <div className="result-item">
              <span className="label">With 10% Waste:</span>
              <span className="value">{results.tonnageWithWaste}</span>
            </div>
          </div>

          <h3>Cost Estimate</h3>
          <div className="result-grid">
            <div className="result-item highlight">
              <span className="label">Material Cost:</span>
              <span className="value">{results.materialCost}</span>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}