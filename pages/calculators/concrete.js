import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

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

    // Validate inputs
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

    // Clear errors
    setErrors({});

    // Calculate
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const thickness = parseFloat(dimensions.thickness);

    const volumeCubicFeet = (length * width * thickness) / 12;
    const volumeCubicYards = volumeCubicFeet / 27;
    const volumeWithWaste = volumeCubicYards * 1.1;
    const bags80lb = Math.ceil(volumeCubicFeet * 0.6);
    const estimatedCost = volumeWithWaste * 130;

    setResults({
      area: length * width,
      volumeCubicFeet,
      volumeCubicYards,
      volumeWithWaste,
      bags80lb,
      estimatedCost
    });
  };

  const reset = () => {
    setDimensions({ length: '', width: '', thickness: '4' });
    setResults(null);
    setErrors({});
  };

  const exportToPDF = () => {
    window.print();
  };

  const exportToCSV = () => {
    if (!results) return;

    const csv = [
      ['Measurement', 'Value'],
      ['Length (ft)', dimensions.length],
      ['Width (ft)', dimensions.width],
      ['Thickness (in)', dimensions.thickness],
      ['Area (sq ft)', results.area.toFixed(2)],
      ['Volume (cu yd)', results.volumeCubicYards.toFixed(2)],
      ['With 10% Waste (cu yd)', results.volumeWithWaste.toFixed(2)],
      ['80lb Bags Needed', results.bags80lb],
      ['Estimated Cost', `${results.estimatedCost.toFixed(2)}`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'concrete-estimate.csv';
    a.click();
  };

  return (
    <>
      <Head>
        <title>Concrete Calculator - CostFlowAI</title>
        <meta name="description" content="Calculate concrete volume, bags, and costs for your construction project" />
      </Head>

      <nav className="nav-header">
        <Link href="/">Home</Link>
        <Link href="/calculators">Calculators</Link>
        <span>Concrete Calculator</span>
      </nav>

      <main className="calculator-container">
        <h1>Concrete Calculator</h1>
        <p>Calculate concrete volume and materials for your project</p>

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
                <span className="value">{results.volumeCubicYards.toFixed(2)} cu yd</span>
              </div>
              <div className="result-item">
                <span className="label">With 10% Waste:</span>
                <span className="value">{results.volumeWithWaste.toFixed(2)} cu yd</span>
              </div>
              <div className="result-item">
                <span className="label">80lb Bags:</span>
                <span className="value">{results.bags80lb} bags</span>
              </div>
              <div className="result-item highlight">
                <span className="label">Estimated Cost:</span>
                <span className="value">${results.estimatedCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="formula-display">
              <h3>Calculation Method:</h3>
              <code>
                Volume (cu ft) = {dimensions.length} × {dimensions.width} × ({dimensions.thickness} ÷ 12)<br/>
                Volume (cu yd) = Volume (cu ft) ÷ 27<br/>
                With Waste = Volume × 1.1 (10% waste factor)<br/>
                Cost = Volume with Waste × $130 per cubic yard
              </code>
            </div>

            <div className="export-buttons">
              <button onClick={exportToPDF}>Export PDF</button>
              <button onClick={exportToCSV}>Export CSV</button>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .calculator-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .calculator-form {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }

        .form-group input.error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 14px;
          margin-top: 5px;
          display: block;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .btn-primary, .btn-secondary {
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: #4CAF50;
          color: white;
        }

        .btn-primary:hover {
          background: #45a049;
        }

        .btn-secondary {
          background: #f44336;
          color: white;
        }

        .results-container {
          margin-top: 30px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .result-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 10px;
          background: white;
          border-radius: 4px;
        }

        .result-item.highlight {
          background: #4CAF50;
          color: white;
          font-weight: bold;
        }

        .formula-display {
          margin: 20px 0;
          padding: 15px;
          background: #f0f0f0;
          border-left: 4px solid #4CAF50;
        }

        .formula-display code {
          font-family: monospace;
          font-size: 14px;
          line-height: 1.6;
        }

        .export-buttons {
          margin-top: 20px;
          display: flex;
          gap: 10px;
        }

        .export-buttons button {
          padding: 10px 20px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .export-buttons button:hover {
          background: #1976D2;
        }

        @media (max-width: 600px) {
          .result-grid {
            grid-template-columns: 1fr;
          }

          .button-group, .export-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}