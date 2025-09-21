document.addEventListener('DOMContentLoaded', () => {
  const start = document.getElementById('btn-start');
  if (start) {
    start.addEventListener('click', e => {
      e.preventDefault();
      location.href = '/calculators/concrete/';
    });
  }
});