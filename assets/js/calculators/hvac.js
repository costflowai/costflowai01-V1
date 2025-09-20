// HVAC Calculator
export function init(el) {  // Defensive check for DOM element  if (!el) {    console.error('Calculator: No container element provided');    return;  }
  // Initialize calculator UI in the provided element
}

export function compute(state) {
  return { ok: false, msg: "Not implemented" };
}

export function explain(state) {
  return "TBD";
}

export function meta() {
  return {
    id: "hvac",
    title: "HVAC Calculator",
    category: "mep"
  };
}