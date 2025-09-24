import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  calculateVolume,
  formatters
} from '../../utils/calculatorUtils';

export default function ExcavationCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    depth: ''
  });

  const [soilType, setSoilType] = useState('normal');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const soilTypes = {
    normal: { name: 'Normal Soil', factor: 1.0, difficulty: 1.0 },
    clay: { name: 'Clay Soil', factor: 0.85, difficulty: 1.3 },
    sand: { name: 'Sandy Soil', factor: 1.2, difficulty: 0.9 },
    rocky: { name: 'Rocky Soil', factor: 0.75, difficulty: 1.8 },
    mixed: { name: 'Mixed Soil', factor: 1.1, difficulty: 1.1 }
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

    // Calculate excavation requirements
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const depth = parseFloat(dimensions.depth);

    const soil = soilTypes[soilType];

    const volumeCubicFeet = calculateVolume.cubicFeet(length, width, depth);
    const volumeCubicYards = calculateVolume.cubicYards(volumeCubicFeet);

    // Account for soil expansion factor
    const actualVolume = volumeCubicYards * soil.factor;

    // Calculate tonnage for disposal (assuming 1.3 tons per cubic yard average)
    const tonnage = actualVolume * 1.3;

    // Excavation costs
    const baseRatePerYard = 8; // Base rate per cubic yard
    const adjustedRate = baseRatePerYard * soil.difficulty;
    const excavationCost = volumeCubicYards * adjustedRate;

    // Hauling costs (depends on distance, assuming local disposal)
    const haulingCost = actualVolume * 15; // $15 per cubic yard hauling

    // Disposal costs
    const disposalCost = tonnage * 25; // $25 per ton disposal

    // Equipment costs (daily rate divided by typical daily volume)
    const equipmentHours = volumeCubicYards / 25; // 25 cy per hour average
    const equipmentCost = equipmentHours * 125; // $125/hour for excavator

    const totalCost = excavationCost + haulingCost + disposalCost + equipmentCost;

    const calculatedResults = {
      area: formatters.area(length * width),
      volumeToExcavate: formatters.volume(volumeCubicYards, 'cu yd'),
      actualVolume: formatters.volume(actualVolume, 'cu yd'),
      soilType: soil.name,
      tonnage: formatters.weight(tonnage),
      excavationCost: formatters.currency(excavationCost),
      haulingCost: formatters.currency(haulingCost),
      disposalCost: formatters.currency(disposalCost),
      equipmentCost: formatters.currency(equipmentCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('excavation', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Excavation Calculator"
      description="Calculate excavation costs and soil removal requirements. Get accurate estimates for digging, hauling, and disposal based on soil type and project size."
      results={results}
      inputs={dimensions}
      calculatorType="excavation"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Excavation Length (feet)</label>
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
            <label htmlFor="width">Excavation Width (feet)</label>
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
            <label htmlFor="depth">Excavation Depth (feet)</label>
            <input
              type="number"
              id="depth"
              value={dimensions.depth}
              onChange={(e) => setDimensions({...dimensions, depth: e.target.value})}
              placeholder="Enter depth"
              className={errors.depth ? 'error' : ''}
              step="0.1"
              min="0.5"
            />
            {errors.depth && <span className="error-message">{errors.depth}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="soilType">Soil Type</label>
            <select
              id="soilType"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
            >
              <option value="normal">Normal Soil (Standard)</option>
              <option value="clay">Clay Soil (Difficult to dig)</option>
              <option value="sand">Sandy Soil (Loose, expands more)</option>
              <option value="rocky">Rocky Soil (Very difficult)</option>
              <option value="mixed">Mixed Soil (Variable conditions)</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Excavation</button>
        </div>

        <div className="formula-display">
          <h3>Calculation Details</h3>
          <code>
            Volume = Length × Width × Depth ÷ 27 (cubic yards)<br/>
            Soil expansion factor varies by type<br/>
            Includes excavation, hauling, disposal, and equipment costs<br/>
            Rates are regional averages and may vary
          </code>
        </div>
      </form>
    </CalculatorLayout>
  );
}