(function(){
    const $ = id => document.getElementById(id);

    function calc(){
        const surfaceArea = +$('surfaceArea').value || 0;
        const coats = +$('coats').value || 2;
        const coverage = +$('coverage').value || 350;

        // Calculate total area to cover (surface area × coats)
        const totalArea = surfaceArea * coats;

        // Calculate paint needed (add 10% waste factor)
        const paintNeeded = Math.ceil((totalArea / coverage) * 1.1);

        // Calculate primer needed (assume 1 coat of primer)
        const primerNeeded = Math.ceil((surfaceArea / coverage) * 1.1);

        // Display results
        $('resultPaint').textContent = paintNeeded;
        $('resultPrimer').textContent = primerNeeded;
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