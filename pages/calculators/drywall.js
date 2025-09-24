import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
    if (!dimensions.length || dimensions.length <= 0) {
      newErrors.length = 'Length is required';
    }
    if (!dimensions.width || dimensions.width <= 0) {
      newErrors.width = 'Width is required';
    }
    if (!dimensions.height || dimensions.height <= 0) {
      newErrors.height = 'Height is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);

    const wallArea = 2 * (length + width) * height;
    const sheets4x8 = Math.ceil(wallArea / 32); // 4x8 sheet = 32 sq ft
    const sheetsWithWaste = Math.ceil(sheets4x8 * 1.1); // 10% waste
    const mudBuckets = Math.ceil(sheetsWithWaste * 0.5); // ~0.5 bucket per sheet
    const tapeRolls = Math.ceil(sheetsWithWaste * 0.1); // ~0.1 roll per sheet
    const estimatedCost = sheetsWithWaste * 12 + mudBuckets * 15 + tapeRolls * 8;

    setResults({
      wallArea,
      sheets4x8,
      sheetsWithWaste,
      mudBuckets,
      tapeRolls,
      estimatedCost
    });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', height: '8' });
    setResults(null);
    setErrors({});
  };

  return (
    <>
      <Head>
        <title>Drywall Calculator - CostFlowAI</title>
        <meta name="description" content="Calculate drywall sheets, mud, and materials for your construction project" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <span>Drywall Calculator</span>
      </nav>

      <main className="calculator-container">
        <h1>Drywall Calculator</h1>
        <p>Calculate drywall sheets and materials for your room</p>

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
                <span className="label">4x8 Sheets Needed:</span>
                <span className="value">{results.sheets4x8} sheets</span>
              </div>
              <div className="result-item">
                <span className="label">With 10% Waste:</span>
                <span className="value">{results.sheetsWithWaste} sheets</span>
              </div>
              <div className="result-item">
                <span className="label">Mud Buckets:</span>
                <span className="value">{results.mudBuckets} buckets</span>
              </div>
              <div className="result-item">
                <span className="label">Tape Rolls:</span>
                <span className="value">{results.tapeRolls} rolls</span>
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