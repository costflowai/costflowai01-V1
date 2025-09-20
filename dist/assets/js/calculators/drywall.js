(function(){
    const $ = id => document.getElementById(id);

    function calc(){
        const wallArea = +$('wallArea').value || 0;
        const ceilingArea = +$('ceilingArea').value || 0;
        const openings = +$('openings').value || 0;

        // Calculate net area
        const netArea = wallArea + ceilingArea - openings;

        // Calculate sheets needed (32 sq ft per 4'x8' sheet, add 10% waste)
        const sheetsNeeded = Math.ceil((netArea / 32) * 1.1);

        // Calculate joint compound (1 gallon per 300 sq ft)
        const mudNeeded = Math.ceil(netArea / 300);

        // Calculate tape needed (linear feet of joints, approximate)
        const tapeNeeded = Math.ceil(netArea * 0.9); // Rough estimate

        // Display results
        $('resultSheets').textContent = sheetsNeeded;
        $('resultMud').textContent = mudNeeded;
        $('resultTape').textContent = tapeNeeded;
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