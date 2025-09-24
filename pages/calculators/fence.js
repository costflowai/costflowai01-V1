import { useState } from 'react';
import CalculatorLayout from '../../components/CalculatorLayout';
import { trackCalculatorUse } from '../../components/Analytics';
import {
  validatePositiveNumber,
  validateInteger,
  formatters
} from '../../utils/calculatorUtils';

export default function FenceCalculator() {
  const [dimensions, setDimensions] = useState({
    length: '',
    height: '6',
    postSpacing: '8'
  });

  const [fenceType, setFenceType] = useState('wood');
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const fenceTypes = {
    wood: { name: 'Wood Privacy Fence', postPrice: 25, panelPrice: 35, laborMultiplier: 1.5 },
    vinyl: { name: 'Vinyl Fence', postPrice: 45, panelPrice: 65, laborMultiplier: 1.2 },
    chainlink: { name: 'Chain Link Fence', postPrice: 15, panelPrice: 12, laborMultiplier: 1.0 },
    aluminum: { name: 'Aluminum Fence', postPrice: 35, panelPrice: 55, laborMultiplier: 1.3 },
    composite: { name: 'Composite Fence', postPrice: 50, panelPrice: 85, laborMultiplier: 1.4 }
  };

  const calculate = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    newErrors.length = validatePositiveNumber(dimensions.length, 'Length');
    newErrors.height = validatePositiveNumber(dimensions.height, 'Height');
    newErrors.postSpacing = validateInteger(dimensions.postSpacing, 'Post Spacing');

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

    // Calculate fence requirements
    const length = parseFloat(dimensions.length);
    const height = parseFloat(dimensions.height);
    const spacing = parseFloat(dimensions.postSpacing);

    const fence = fenceTypes[fenceType];

    // Posts calculation (including corner and gate posts)
    const numberOfPosts = Math.ceil(length / spacing) + 1;

    // Panels calculation
    const numberOfPanels = Math.ceil(length / spacing);

    // Linear feet calculation
    const linearFeet = length;

    // Material costs
    const postCost = numberOfPosts * fence.postPrice;
    const panelCost = numberOfPanels * fence.panelPrice;

    // Additional materials (concrete, hardware, etc.)
    const hardwareCost = numberOfPosts * 8; // Concrete and hardware per post
    const gateCost = linearFeet > 20 ? 150 : 0; // Add gate for longer fences

    const totalMaterialCost = postCost + panelCost + hardwareCost + gateCost;

    // Labor calculation
    const laborCost = totalMaterialCost * fence.laborMultiplier;

    const totalCost = totalMaterialCost + laborCost;

    const calculatedResults = {
      linearFeet: formatters.number(linearFeet) + ' ft',
      numberOfPosts: formatters.count(numberOfPosts),
      numberOfPanels: formatters.count(numberOfPanels),
      fenceType: fence.name,
      postCost: formatters.currency(postCost),
      panelCost: formatters.currency(panelCost),
      hardwareCost: formatters.currency(hardwareCost),
      gateCost: gateCost > 0 ? formatters.currency(gateCost) : 'Not included',
      materialCost: formatters.currency(totalMaterialCost),
      laborCost: formatters.currency(laborCost),
      estimatedCost: formatters.currency(totalCost)
    };

    setResults(calculatedResults);
    trackCalculatorUse('fence', calculatedResults);
  };

  return (
    <CalculatorLayout
      title="Fence Calculator"
      description="Calculate materials and costs for fence installation projects. Get accurate estimates for wood, vinyl, chain link, aluminum, and composite fencing."
      results={results}
      inputs={dimensions}
      calculatorType="fence"
    >
      <form onSubmit={calculate} className="calculator-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="length">Fence Length (feet)</label>
            <input
              type="number"
              id="length"
              value={dimensions.length}
              onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
              placeholder="Enter total length"
              className={errors.length ? 'error' : ''}
              step="1"
            />
            {errors.length && <span className="error-message">{errors.length}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="height">Fence Height (feet)</label>
            <select
              id="height"
              value={dimensions.height}
              onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
            >
              <option value="4">4 feet</option>
              <option value="6">6 feet</option>
              <option value="8">8 feet</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="postSpacing">Post Spacing (feet)</label>
            <select
              id="postSpacing"
              value={dimensions.postSpacing}
              onChange={(e) => setDimensions({...dimensions, postSpacing: e.target.value})}
            >
              <option value="6">6 feet</option>
              <option value="8">8 feet</option>
              <option value="10">10 feet</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fenceType">Fence Type</label>
            <select
              id="fenceType"
              value={fenceType}
              onChange={(e) => setFenceType(e.target.value)}
            >
              <option value="wood">Wood Privacy Fence</option>
              <option value="vinyl">Vinyl Fence</option>
              <option value="chainlink">Chain Link Fence</option>
              <option value="aluminum">Aluminum Fence</option>
              <option value="composite">Composite Fence</option>
            </select>
          </div>
        </div>

        <div className="button-group">
          <button type="submit" className="btn-primary">Calculate Fence</button>
        </div>

        <div className="formula-display">
          <h3>Calculation Notes</h3>
          <code>
            Posts = (Length ÷ Spacing) + 1 corner post<br/>
            Panels = Length ÷ Spacing (rounded up)<br/>
            Includes concrete, hardware, and potential gate costs<br/>
            Labor varies by material type and complexity
          </code>
        </div>
      </form>
    </CalculatorLayout>
  );
}