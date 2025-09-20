(function(){
    const $ = id => document.getElementById(id);

    function calc(){
        const L = +$('length').value || 0;
        const W = +$('width').value || 0;
        const T = +$('thickness').value || 0;

        // Convert thickness from inches to feet
        const thicknessFeet = T / 12;

        // Calculate volume in cubic feet
        const volCubicFeet = L * W * thicknessFeet;

        // Convert to cubic yards (27 cubic feet = 1 cubic yard)
        const volCubicYards = volCubicFeet / 27;

        // Add 10% waste factor
        const concreteNeeded = volCubicYards * 1.1;

        // Display results
        $('resultVolume').textContent = volCubicYards.toFixed(3);
        $('resultConcrete').textContent = concreteNeeded.toFixed(3);
        $('results').style.display = 'block';

        // TODO: Add material, labor, OH&P with transparent line-items from constants in /assets/data/prices.json
    }

    // Event listener for calculate button
    document.addEventListener('click', e => {
        if(e.target.id === 'btnCalc') {
            e.preventDefault();
            calc();
        }
    });
})();