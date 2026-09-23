export const UNITS = [
  { value: "sqft", label: "Sq. Ft" },
  { value: "sqyd_gaj", label: "Sq. Yard (Gaj)" },
  { value: "sqm", label: "Sq. Meter" },
  { value: "acre", label: "Acre" },
  { value: "bigha", label: "Bigha" },
];

export const UNIT_LABEL = Object.fromEntries(UNITS.map((u) => [u.value, u.label]));

/**
 * Converts an area value between units via a common sqft base. Bigha has no fixed national
 * size, so converting to/from it needs a `state` key into `rates.bighaByState`.
 */
export function convertArea(value, fromUnit, toUnit, rates, state) {
  if (!Number.isFinite(value)) return null;
  if (fromUnit === toUnit) return value;

  const toSqft = (unit) => (unit === "bigha" ? rates.bighaByState[state] : rates.rates[unit]);
  const fromFactor = toSqft(fromUnit);
  const toFactor = toSqft(toUnit);
  if (!fromFactor || !toFactor) return null;

  const valueInSqft = value * fromFactor;
  return valueInSqft / toFactor;
}

/** Formats a converted area value for display — more decimals for small units, fewer for large. */
export function formatArea(value, unit) {
  if (value == null || !Number.isFinite(value)) return "—";
  const decimals = unit === "acre" || unit === "bigha" ? 3 : unit === "sqm" ? 2 : 0;
  return value.toLocaleString("en-IN", { maximumFractionDigits: decimals });
}
