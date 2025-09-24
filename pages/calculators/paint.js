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
    coats: '2'
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const calculate = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!dimensions.length || dimensions.length <= 0) {
      newErrors.length = 'Length is required';
    }
    if (!dimensions.width || dimensions.width <= 0) {
      newErrors.width = 'Width is required';
    }
    if (!dimensions.height || dimensions.height <= 0) {
      newErrors.height = 'Height is required';
    }
    if (!dimensions.coats || dimensions.coats <= 0) {
      newErrors.coats = 'Number of coats is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const coats = parseFloat(dimensions.coats);

    const wallArea = 2 * (length + width) * height;
    const ceilingArea = length * width;
    const totalArea = wallArea + ceilingArea;
    const paintableArea = totalArea * coats; // Account for multiple coats
    const gallonsNeeded = paintableArea / 350; // 1 gallon covers ~350 sq ft
    const gallonsWithWaste = gallonsNeeded * 1.1; // 10% waste factor
    const gallonsPurchase = Math.ceil(gallonsWithWaste);
    const estimatedCost = gallonsPurchase * 35; // $35 per gallon estimate

    setResults({
      wallArea,
      ceilingArea,
      totalArea,
      paintableArea,
      gallonsNeeded,
      gallonsWithWaste,
      gallonsPurchase,
      estimatedCost
    });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', height: '8', coats: '2' });
    setResults(null);
    setErrors({});
  };

  return (
    <>
      <Head>
        <title>Paint Calculator - CostFlowAI</title>
        <meta name="description" content="Calculate paint quantities and costs for your painting project" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <span>Paint Calculator</span>
      </nav>

      <main className="calculator-container">
        <h1>Paint Calculator</h1>
        <p>Calculate paint quantities for your room painting project</p>

        <form onSubmit={calculate} className="calculator-form">
          <div className="form-group">
            <label htmlFor="length">Room Length (feet)</label>
            <input
              type="number"
              id="length"
              step="0.1"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              className={errors.length ? 'error' : ''}
            />
            {errors.length && <span className="error-message">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="width">Room Width (feet)</label>
            <input
              type="number"
              id="width"
              step="0.1"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              className={errors.width ? 'error' : ''}
            />
            {errors.width && <span className="error-message">{errors.width}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="height">Ceiling Height (feet)</label>
            <input
              type="number"
              id="height"
              step="0.5"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
              className={errors.height ? 'error' : ''}
            />
            {errors.height && <span className="error-message">{errors.height}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="coats">Number of Coats</label>
            <input
              type="number"
              id="coats"
              min="1"
              max="4"
              value={dimensions.coats}
              onChange={(e) => setDimensions({...dimensions, coats: e.target.value})}
              className={errors.coats ? 'error' : ''}
            />
            {errors.coats && <span className="error-message">{errors.coats}</span>}
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary">Calculate</button>
            <button type="button" onClick={reset} className="btn-secondary">Reset</button>
          </div>
        </form>

        {results && (
          <div className="results-container">
            <h2>Calculation Results</h2>

            <div className="result-grid">
              <div className="result-item">
                <span className="label">Wall Area:</span>
                <span className="value">{results.wallArea.toFixed(2)} sq ft</span>
              </div>
              <div className="result-item">
                <span className="label">Ceiling Area:</span>
                <span className="value">{results.ceilingArea.toFixed(2)} sq ft</span>
              </div>
              <div className="result-item">
                <span className="label">Total Area:</span>
                <span className="value">{results.totalArea.toFixed(2)} sq ft</span>
              </div>
              <div className="result-item">
                <span className="label">Paint Needed:</span>
                <span className="value">{results.gallonsNeeded.toFixed(2)} gallons</span>
              </div>
              <div className="result-item">
                <span className="label">With 10% Waste:</span>
                <span className="value">{results.gallonsWithWaste.toFixed(2)} gallons</span>
              </div>
              <div className="result-item">
                <span className="label">Gallons to Buy:</span>
                <span className="value">{results.gallonsPurchase} gallons</span>
              </div>
              <div className="result-item highlight">
                <span className="label">Estimated Cost:</span>
                <span className="value">${results.estimatedCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}