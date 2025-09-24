import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateVolume,
  formatters
} from '../../utils/calculatorUtils';

export default function GravelCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    depth: '3'
  });

  const [gravelType, setGravelType] = useState('pea');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const gravelTypes = {
    pea: { name: 'Pea Gravel', weight: 96, price: 35 },
    crushed: { name: 'Crushed Stone', weight: 100, price: 30 },
    river: { name: 'River Rock', weight: 89, price: 45 },
    decomposed: { name: 'Decomposed Granite', weight: 110, price: 40 },
    limestone: { name: 'Limestone Chips', weight: 105, price: 32 }
  };

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.depth = validatePositiveNumber(dimensions.depth, 'Depth');

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

    // Calculate gravel requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const depth = parseFloat(dimensions.depth);

    const volumeCubicFeet = calculateVolume.cubicFeet(length, width, depth);
    const volumeCubicYards = calculateVolume.cubicYards(volumeCubicFeet);

    // Add waste factor
    const volumeWithWaste = calculateVolume.withWasteFactor(volumeCubicYards, 0.1);

    const gravel = gravelTypes[gravelType];

    // Calculate tonnage (lbs per cubic foot / 2000)
    const tonnage = (volumeCubicFeet * gravel.weight) / 2000;
    const tonnageWithWaste = tonnage * 1.1;

    // Calculate costs
    const materialCost = volumeWithWaste * gravel.price;
    const deliveryCost = materialCost * 0.15; // 15% delivery
    const totalCost = materialCost + deliveryCost;

    const calculatedResults = {
      area: formatters.area(length * width),
      volumeCubicFeet: formatters.volume(volumeCubicFeet, 'cu ft'),
      volumeCubicYards: formatters.volume(volumeCubicYards, 'cu yd'),
      volumeWithWaste: formatters.volume(volumeWithWaste, 'cu yd'),
      gravelType: gravel.name,
      tonnage: formatters.weight(tonnageWithWaste),
      materialCost: formatters.currency(materialCost),
      deliveryCost: formatters.currency(deliveryCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('gravel', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Gravel Calculator"
      description="Calculate gravel and stone requirements for driveways, walkways, and landscaping projects. Get accurate tonnage and cost estimates."
      results={results}
      inputs={dimensions}
      calculatorType="gravel"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Area Length (feet)</label>
            <input
              type="number"
              id="length"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              placeholder="Enter length"
              className={errors.length ? 'error' : ''}
              step="0.1"
            />
            {errors.length && <span className="error-message">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="width">Area Width (feet)</label>
            <input
              type="number"
              id="width"
              value={dimensions.width}
              onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
              placeholder="Enter width"
              className={errors.width ? 'error' : ''}
              step="0.1"
            />
            {errors.width && <span className="error-message">{errors.width}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="depth">Depth (inches)</label>
            <input
              type="number"
              id="depth"
              value={dimensions.depth}
              onChange={(e) => setDimensions({...dimensions, depth: e.target.value})}
              placeholder="3"
              className={errors.depth ? 'error' : ''}
              step="0.5"
              min="1"
              max="12"
            />
            {errors.depth && <span className="error-message">{errors.depth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gravelType">Gravel Type</label>
            <select
              id="gravelType"
              value={gravelType}
              onChange={(e) => setGravelType(e.target.value)}
            >
              <option value="pea">Pea Gravel ($35/yd³)</option>
              <option value="crushed">Crushed Stone ($30/yd³)</option>
              <option value="river">River Rock ($45/yd³)</option>
              <option value="decomposed">Decomposed Granite ($40/yd³)</option>
              <option value="limestone">Limestone Chips ($32/yd³)</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Gravel</button>
        </div>

        <div className="formula-display">
          <h3>Calculation Formula</h3>
          <code>
            Volume (cu yd) = Length × Width × Depth ÷ 324 (inches to cubic yards)<br/>
            Tonnage = Volume × Material Weight ÷ 2000<br/>
            Total includes 10% waste factor + 15% delivery cost
          </code>
        </div>
      </form>
    </CalculatorLayout>
  );
}