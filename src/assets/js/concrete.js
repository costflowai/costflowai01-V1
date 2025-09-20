document.addEventListener("DOMContentLoaded", () => {
  const f = document.getElementById("concrete-form");
  if (!f) throw new Error("Concrete calculator form not found");

  const get = id => Number(document.getElementById(id).value) || 0;

  document.getElementById("btn-calc").addEventListener("click", () => {
    const L = get("length");
    const W = get("width");
    const T_in = get("thickness");

    if (L <= 0 || W <= 0 || T_in <= 0) {
      alert("Please enter valid positive numbers for all fields");
      return;
    }

    const vol_ft3 = L * W * (T_in / 12);
    const vol_yd3 = vol_ft3 / 27;

    document.getElementById("res-volume").textContent = vol_yd3.toFixed(2);
  });
});