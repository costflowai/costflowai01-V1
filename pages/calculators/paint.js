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

export default function PaintCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '8',
    doors: '2',
    windows: '4',
    coats: '2'
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
    const doors = parseInt(dimensions.doors) || 0;
    const windows = parseInt(dimensions.windows) || 0;
    const coats = parseInt(dimensions.coats) || 1;

    const wallArea = (2 * length * height) + (2 * width * height);
    const ceilingArea = length * width;
    const doorArea = doors * 20; // 20 sq ft per door
    const windowArea = windows * 10; // 10 sq ft per window

    const totalArea = wallArea + ceilingArea - doorArea - windowArea;
    const gallonsNeeded = materials.paint.gallonsNeeded(totalArea, coats);
    const gallonsToBuy = materials.paint.gallonsPurchase(gallonsNeeded);
    const primerGallons = Math.ceil(gallonsNeeded * 0.8); // Usually need less primer

    const paintCost = gallonsToBuy * pricing.paint.gallonEach;
    const primerCost = primerGallons * pricing.paint.primerGallonEach;
    const totalCost = paintCost + primerCost;

    const calculationResults = {
      totalArea: formatters.area(totalArea),
      wallArea: formatters.area(wallArea),
      ceilingArea: formatters.area(ceilingArea),
      gallonsNeeded: `${gallonsNeeded.toFixed(1)} gallons`,
      gallonsToBuy: `${gallonsToBuy} gallons`,
      primerGallons: `${primerGallons} gallons`,
      paintCost: formatters.currency(paintCost),
      primerCost: formatters.currency(primerCost),
      totalCost: formatters.currency(totalCost)
    };

    setResults(calculationResults);
    trackCalculatorUse('paint', { length, width, height, coats });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', height: '8', doors: '2', windows: '4', coats: '2' });
    setResults(null);
    setErrors({});
  };

  return (
    <CalculatorLayout
      title="Professional Paint Calculator"
      description="Calculate paint and primer needed for your interior and exterior painting projects."
      results={results}
      inputs={dimensions}
      calculatorType="paint"
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="doors">Number of Doors</label>
            <input
              type="number"
              id="doors"
              min="0"
              max="20"
              value={dimensions.doors}
              onChange={(e) => setDimensions({...dimensions, doors: e.target.value})}
              placeholder="e.g., 2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="windows">Number of Windows</label>
            <input
              type="number"
              id="windows"
              min="0"
              max="50"
              value={dimensions.windows}
              onChange={(e) => setDimensions({...dimensions, windows: e.target.value})}
              placeholder="e.g., 4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="coats">Coats of Paint</label>
            <select
              id="coats"
              value={dimensions.coats}
              onChange={(e) => setDimensions({...dimensions, coats: e.target.value})}
            >
              <option value="1">1 Coat</option>
              <option value="2">2 Coats</option>
              <option value="3">3 Coats</option>
            </select>
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
          Calculate paint and primer needs based on room dimensions
        </div>
      </form>

      {results && (
        <div className="results-container">
          <h2>Paint Calculation Results</h2>

          <div className="result-grid">
            <div className="result-item">
              <span className="label">Total Paint Area:</span>
              <span className="value">{results.totalArea}</span>
            </div>
            <div className="result-item">
              <span className="label">Wall Area:</span>
              <span className="value">{results.wallArea}</span>
            </div>
            <div className="result-item">
              <span className="label">Ceiling Area:</span>
              <span className="value">{results.ceilingArea}</span>
            </div>
            <div className="result-item">
              <span className="label">Paint Needed:</span>
              <span className="value">{results.gallonsNeeded}</span>
            </div>
            <div className="result-item">
              <span className="label">Paint to Buy:</span>
              <span className="value">{results.gallonsToBuy}</span>
            </div>
            <div className="result-item">
              <span className="label">Primer Needed:</span>
              <span className="value">{results.primerGallons}</span>
            </div>
          </div>

          <h3>Cost Estimates</h3>
          <div className="result-grid">
            <div className="result-item">
              <span className="label">Paint Cost:</span>
              <span className="value">{results.paintCost}</span>
            </div>
            <div className="result-item">
              <span className="label">Primer Cost:</span>
              <span className="value">{results.primerCost}</span>
            </div>
            <div className="result-item highlight">
              <span className="label">Total Material Cost:</span>
              <span className="value">{results.totalCost}</span>
            </div>
          </div>
        </div>
      )}
    </CalculatorLayout>
  );
}