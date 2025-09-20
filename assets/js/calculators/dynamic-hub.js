// Dynamic Calculator Hub - Load calculators from registry
import { calculatorRegistry } from './registry.js';

document.addEventListener('DOMContentLoaded', async function() {
    await renderCalculatorGrid();
});

async function renderCalculatorGrid() {
    const gridContainer = document.querySelector('.calculator-grid');
    if (!gridContainer) return;

    // Clear existing content
    gridContainer.innerHTML = '';
    
    // Update count
    const countElement = document.getElementById('calculator-count');
    if (countElement) {
        countElement.textContent = calculatorRegistry.length;
    }

    // Group calculators by category
    const categories = {
        'Structural & Concrete': ['concrete', 'framing', 'masonry', 'steel'],
        'MEP Systems': ['plumbing', 'electrical', 'hvac'],
        'Finishes': ['drywall', 'paint', 'flooring'],
        'Exterior & Envelope': ['roofing', 'doorswindows', 'insulation'],
        'Sitework': ['earthwork', 'asphalt', 'siteconcrete', 'demolition'],
        'Specialties & Protection': ['firestop', 'waterproof'],
        'Project Management': ['genconds', 'fees']
    };

    for (const [categoryName, calcIds] of Object.entries(categories)) {
        const categorySection = document.createElement('div');
        categorySection.innerHTML = `
            <h3>${categoryName}</h3>
            <div class="calculator-category" id="category-${categoryName.replace(/\s+/g, '-').toLowerCase()}"></div>
        `;
        gridContainer.appendChild(categorySection);

        const categoryContainer = categorySection.querySelector('.calculator-category');

        for (const calcId of calcIds) {
            const calcEntry = calculatorRegistry.find(c => c.id === calcId);
            if (!calcEntry) continue;

            const calcCard = document.createElement('div');
            calcCard.className = 'calculator-card';
            
            // Get enhanced descriptions for key calculators
            const enhancedDescriptions = {
                concrete: 'Professional concrete slab calculator with material quantities, rebar layout, regional pricing, and comprehensive cost breakdown including labor and overhead',
                plumbing: 'Calculate plumbing materials including pipe sizing, fittings, fixtures with hydraulic engineering principles and IPC compliance',
                electrical: 'Calculate electrical materials including wire, conduit, panels, and devices with NEC compliance and load calculations',
                hvac: 'Calculate HVAC system components, ductwork sizing, and thermal load calculations with ASHRAE standards and Manual J methodology',
                flooring: 'Calculate flooring materials for tile, hardwood, carpet, vinyl, and other floor finishes with waste factors, installation requirements, and comprehensive cost analysis',
                roofing: 'Calculate roofing materials including shingles, underlayment, flashing, and accessories with industry-standard formulas'
            };

            const description = enhancedDescriptions[calcId] || calcEntry.description;
            const title = calcId.charAt(0).toUpperCase() + calcId.slice(1).replace(/([A-Z])/g, ' $1') + ' Calculator';
            const titleProfessional = ['concrete', 'plumbing', 'electrical', 'hvac', 'flooring', 'roofing'].includes(calcId) ? 
                'Professional ' + title : title;

            let features = '';
            if (['concrete', 'plumbing', 'electrical', 'hvac', 'flooring', 'roofing'].includes(calcId)) {
                const featuresList = {
                    concrete: ['✓ Rebar calculations', '✓ Regional pricing', '✓ Export ready', '✓ Labor costs'],
                    plumbing: ['✓ IPC compliance', '✓ Fixture unit calculations', '✓ Pipe sizing', '✓ Regional pricing'],
                    electrical: ['✓ NEC compliance', '✓ Load calculations', '✓ Wire sizing', '✓ Regional pricing'],
                    hvac: ['✓ ASHRAE compliance', '✓ Manual J load calculations', '✓ Ductwork sizing', '✓ Regional pricing'],
                    flooring: ['✓ All flooring types', '✓ Waste factor calculations', '✓ Installation materials', '✓ Regional pricing'],
                    roofing: ['✓ Multiple roof types', '✓ Regional pricing', '✓ Export ready', '✓ Formula transparency']
                };
                
                features = `
                    <div class="calculator-features">
                        ${featuresList[calcId].map(f => `<span class="feature">${f}</span>`).join('')}
                    </div>
                `;
            }

            calcCard.innerHTML = `
                <h4>${titleProfessional}</h4>
                <p>${description}</p>
                ${features}
                <a href="/calculators/${calcId}/" class="btn-primary">Open Calculator</a>
            `;

            categoryContainer.appendChild(calcCard);
        }
    }
}