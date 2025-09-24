import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  validateInteger,
  calculateArea,
  formatters
} from '../../utils/calculatorUtils';

export default function FramingCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '8',
    studSpacing: '16'
  });

  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.width = validatePositiveNumber(dimensions.width, 'Width');
    newErrors.height = validatePositiveNumber(dimensions.height, 'Height');
    newErrors.studSpacing = validateInteger(dimensions.studSpacing, 'Stud Spacing');

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

    // Calculate framing requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const spacing = parseFloat(dimensions.studSpacing);

    // Wall calculations
    const perimeter = 2 * (length + width);
    const wallArea = perimeter * height;

    // Stud calculations (16" or 24" on center)
    const studsPerFoot = 12 / spacing;
    const totalStuds = Math.ceil(perimeter * studsPerFoot);

    // Plates (top and bottom)
    const plateLength = perimeter * 2; // Double top plate + bottom plate

    // Headers for openings (estimate)
    const headerLength = perimeter * 0.2; // Assume 20% openings

    // Material calculations
    const studLumber = totalStuds; // 2x4x8 or 2x6x8
    const plateLumber = Math.ceil(plateLength / 8); // 8-foot pieces
    const headerLumber = Math.ceil(headerLength / 8); // 2x8 or 2x10 headers

    // Pricing (regional averages)
    const studPrice = 3.50; // per stud
    const platePrice = 4.25; // per 8ft piece
    const headerPrice = 12.00; // per header piece

    const studCost = studLumber * studPrice;
    const plateCost = plateLumber * platePrice;
    const headerCost = headerLumber * headerPrice;
    const totalMaterialCost = studCost + plateCost + headerCost;

    // Labor estimate (typically 2-3 times material cost)
    const laborCost = totalMaterialCost * 2.5;
    const totalCost = totalMaterialCost + laborCost;

    const calculatedResults = {
      wallArea: formatters.area(wallArea),
      totalStuds: formatters.count(studLumber),
      plateLength: formatters.number(plateLength) + ' ft',
      headerPieces: formatters.count(headerLumber),
      studCost: formatters.currency(studCost),
      plateCost: formatters.currency(plateCost),
      headerCost: formatters.currency(headerCost),
      materialCost: formatters.currency(totalMaterialCost),
      laborCost: formatters.currency(laborCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('framing', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Framing Calculator"
      description="Calculate lumber and costs for wall framing projects. Get accurate estimates for studs, plates, headers, and total framing materials."
      results={results}
      inputs={dimensions}
      calculatorType="framing"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Building Length (feet)</label>
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
            <label htmlFor="width">Building Width (feet)</label>
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
            <label htmlFor="height">Wall Height (feet)</label>
            <input
              type="number"
              id="height"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
              placeholder="8"
              className={errors.height ? 'error' : ''}
              step="0.5"
            />
            {errors.height && <span className="error-message">{errors.height}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="studSpacing">Stud Spacing (inches)</label>
            <select
              id="studSpacing"
              value={dimensions.studSpacing}
              onChange={(e) => setDimensions({...dimensions, studSpacing: e.target.value})}
            >
              <option value="16">16" On Center</option>
              <option value="24">24" On Center</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Framing</button>
        </div>
      </form>
    </CalculatorLayout>
  );
}