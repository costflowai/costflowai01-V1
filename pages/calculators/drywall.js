import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateArea,
  materials,
  pricing,
  formatters
} from '../../utils/calculatorUtils';

export default function DrywallCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '8'
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const calculate = (e) => {
    e.preventDefault();

    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.height = validatePositiveNumber(dimensions.height, 'Height');

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
    const height = parseFloat(dimensions.height);

    const wallArea = (2 * length * height) + (2 * width * height);
    const sheetSize = 32; // 4x8 sheets = 32 sq ft
    const sheetsNeeded = Math.ceil(wallArea / sheetSize);
    const sheetsWithWaste = Math.ceil(sheetsNeeded * 1.1);

    const jointCompound = Math.ceil(wallArea / 100) * 25; // 25 lb per 100 sq ft
    const tape = Math.ceil(wallArea / 10); // feet of tape
    const screws = Math.ceil(sheetsNeeded * 1.5); // 1.5 lbs per sheet

    const materialCost = (sheetsWithWaste * pricing.drywall.sheetCost) +
                        (jointCompound * pricing.drywall.compoundCost) +
                        (screws * pricing.drywall.screwCost);

    const calculationResults = {
      wallArea: formatters.area(wallArea),
      sheetsNeeded: formatters.count(sheetsNeeded),
      sheetsWithWaste: formatters.count(sheetsWithWaste),
      jointCompound: `${jointCompound} lbs`,
      tape: `${tape} ft`,
      screws: `${screws} lbs`,
      materialCost: formatters.currency(materialCost)
    };

    setResults(calculationResults);
    trackCalculatorUse('drywall', { length, width, height });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', height: '8' });
    setResults(null);
    setErrors({});
  };

  return (
    <CalculatorLayout
      title="Professional Drywall Calculator"
      description="Calculate drywall sheets, joint compound, and materials needed for your construction project."
      results={results}
      inputs={dimensions}
      calculatorType="drywall"
    >
      <form onSubmit={calculate} className="calculator-form" role="form" aria-labelledby="calculator-title">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Room Length (feet)</label>
            <input
              type="number"
              id="length"
              step="0.1"
              min="0"
              max="10000"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              className={errors.length ? 'error' : ''}
              placeholder="e.g., 12"
              aria-describedby={errors.length ? 'length-error' : undefined}
              aria-invalid={errors.length ? 'true' : 'false'}
              aria-required="true"
            />
            {errors.length && <span className="error-message" id="length-error" role="alert">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="width">Room Width (feet)</label>
            <input
              type="number"
              id="width"
              step="0.1"
              min="0"
              max="10000"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              className={errors.width ? 'error' : ''}
              placeholder="e.g., 10"
              aria-describedby={errors.width ? 'width-error' : undefined}
              aria-invalid={errors.width ? 'true' : 'false'}
              aria-required="true"
            />
            {errors.width && <span className="error-message" id="width-error" role="alert">{errors.width}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="height">Ceiling Height (feet)</label>
            <input
              type="number"
              id="height"
              step="0.1"
              min="0"
              max="20"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
              className={errors.height ? 'error' : ''}
              placeholder="e.g., 8"
              aria-describedby={errors.height ? 'height-error' : undefined}
              aria-invalid={errors.height ? 'true' : 'false'}
              aria-required="true"
            />
            {errors.height && <span className="error-message" id="height-error" role="alert">{errors.height}</span>}
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
          Calculate drywall materials needed based on room dimensions
        </div>
      </form>

      {results && (
        <div className="results-container">
          <h2>Drywall Calculation Results</h2>

          <div className="result-grid">
            <div className="result-item">
              <span className="label">Wall Area:</span>
              <span className="value">{results.wallArea}</span>
            </div>
            <div className="result-item">
              <span className="label">Sheets Needed:</span>
              <span className="value">{results.sheetsNeeded}</span>
            </div>
            <div className="result-item">
              <span className="label">With 10% Waste:</span>
              <span className="value">{results.sheetsWithWaste} sheets</span>
            </div>
            <div className="result-item">
              <span className="label">Joint Compound:</span>
              <span className="value">{results.jointCompound}</span>
            </div>
            <div className="result-item">
              <span className="label">Drywall Tape:</span>
              <span className="value">{results.tape}</span>
            </div>
            <div className="result-item">
              <span className="label">Screws Needed:</span>
              <span className="value">{results.screws}</span>
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