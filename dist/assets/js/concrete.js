document.addEventListener('DOMContentLoaded', () => {
  const f = document.getElementById('concrete-form');
  if (!f) throw new Error('Concrete calculator form not found');

  const g = id => Number(document.getElementById(id).value) || 0;
  const results = document.querySelector('.results');

  document.getElementById('btn-calc').addEventListener('click', () => {
    const length = g('length');
    const width = g('width');
    const thickness = g('thickness');

    // Validation
    if (length <= 0 || width <= 0 || thickness <= 0) {
      alert('Please enter valid positive numbers for all fields');
      return;
    }

    // Calculate volume with 20% waste factor
    const volCubicFeet = length * width * (thickness / 12);
    const volCubicYards = volCubicFeet / 27;
    const volWithWaste = volCubicYards * 1.2; // 20% waste factor

    // Update results
    document.getElementById('res-volume').textContent = volWithWaste.toFixed(2);
    results.style.display = 'block';

    // Smooth scroll to results
    results.scrollIntoView({ behavior: 'smooth' });

    // Focus announcement for screen readers
    setTimeout(() => {
      document.getElementById('res-volume').focus();
    }, 500);
  });

  // Enter key handling
  f.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('btn-calc').click();
    }
  });
});