import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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
    if (!dimensions.length || dimensions.length <= 0) {
      newErrors.length = 'Length is required';
    }
    if (!dimensions.width || dimensions.width <= 0) {
      newErrors.width = 'Width is required';
    }
    if (!dimensions.thickness || dimensions.thickness <= 0) {
      newErrors.thickness = 'Thickness is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const thickness = parseFloat(dimensions.thickness);

    const area = length * width;
    const volumeCubicFeet = (area * thickness) / 12;
    const tonnage = volumeCubicFeet * 0.1; // Asphalt weighs ~110 lbs per cubic foot
    const tonnageWithWaste = tonnage * 1.05; // 5% waste factor
    const estimatedCost = tonnageWithWaste * 100; // $100 per ton estimate

    setResults({
      area,
      volumeCubicFeet,
      tonnage,
      tonnageWithWaste,
      estimatedCost
    });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', thickness: '2' });
    setResults(null);
    setErrors({});
  };

  return (
    <>
      <Head>
        <title>Asphalt Calculator - CostFlowAI</title>
        <meta name="description" content="Calculate asphalt tonnage and costs for your paving project" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <span>Asphalt Calculator</span>
      </nav>

      <main className="calculator-container">
        <h1>Asphalt Calculator</h1>
        <p>Calculate asphalt tonnage and materials for your paving project</p>

        <form onSubmit={calculate} className="calculator-form">
          <div className="form-group">
            <label htmlFor="length">Length (feet)</label>
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
            <label htmlFor="width">Width (feet)</label>
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
            <label htmlFor="thickness">Thickness (inches)</label>
            <input
              type="number"
              id="thickness"
              step="0.25"
              value={dimensions.thickness}
              onChange={(e) => setDimensions({...dimensions, thickness: e.target.value})}
              className={errors.thickness ? 'error' : ''}
            />
            {errors.thickness && <span className="error-message">{errors.thickness}</span>}
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
                <span className="label">Area:</span>
                <span className="value">{results.area.toFixed(2)} sq ft</span>
              </div>
              <div className="result-item">
                <span className="label">Volume:</span>
                <span className="value">{results.volumeCubicFeet.toFixed(2)} cu ft</span>
              </div>
              <div className="result-item">
                <span className="label">Tonnage:</span>
                <span className="value">{results.tonnage.toFixed(2)} tons</span>
              </div>
              <div className="result-item">
                <span className="label">With 5% Waste:</span>
                <span className="value">{results.tonnageWithWaste.toFixed(2)} tons</span>
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