(function(){
    const $ = id => document.getElementById(id);

    function calc(){
        const area = +$('area').value || 0;
        const type = $('type').value;
        const rValue = +$('rValue').value || 19;

        let amount, unit, coverage;

        switch(type) {
            case 'batt':
                // Fiberglass batts typically cover area 1:1 with some waste
                amount = Math.ceil(area * 1.05);
                unit = 'square feet';
                coverage = amount;
                break;
            case 'blown':
                // Blown-in cellulose by bags (bag covers ~40 sq ft at R-19)
                amount = Math.ceil(area / 40 * (rValue / 19));
                unit = 'bags';
                coverage = area;
                break;
            case 'foam':
                // Spray foam by board feet (thickness × area)
                const thickness = rValue / 6; // Approximate R-6 per inch
                amount = Math.ceil(area * thickness);
                unit = 'board feet';
                coverage = area;
                break;
            default:
                amount = 0;
                unit = 'units';
                coverage = 0;
        }

        // Display results
        $('resultAmount').textContent = amount;
        $('resultUnit').textContent = unit;
        $('resultCoverage').textContent = coverage;
        $('results').style.display = 'block';
    }

    // Event listener for calculate button
    document.addEventListener('click', e => {
        if(e.target.id === 'btnCalc') {
            e.preventDefault();
            calc();
        }
    });
})();