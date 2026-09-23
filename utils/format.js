/** Format a number as compact Indian Rupees, e.g. 1842500 -> "₹18.4L" */
export function formatINR(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

/** Format a plain count with Indian-style comma grouping, e.g. 12480 -> "12,480" */
export function formatCount(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

/**
 * A Date as a plain "YYYY-MM-DD" string, built from LOCAL date parts.
 * `date.toISOString().slice(0, 10)` looks equivalent but converts through UTC first, which
 * silently shifts the date by a day for part of the day in any timezone ahead of UTC (e.g. IST,
 * which is what this app's mock data — and its users — are modeled around). Every "created on"/
 * "expires on"/"today" timestamp in this app should read local calendar dates through this (or
 * `todayISO()` below) instead.
 */
export function toLocalISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Today's date as a plain "YYYY-MM-DD" string — see `toLocalISODate` above for why this exists. */
export function todayISO() {
  return toLocalISODate(new Date());
}

/** "YYYY-MM-DD HH:MM" timestamp (local time) — the format every Audit Log entry is stamped with. */
export function nowLogTimestamp() {
  const d = new Date();
  return `${toLocalISODate(d)} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** City strings across listings/leads are stored as "Locality, City" — this pulls just the city part. */
export function cityOf(location) {
  const parts = (location ?? "").split(",");
  return parts[parts.length - 1].trim();
}

/** First letter of up to two words, e.g. "Ravi Mehta" -> "RM" — used by every avatar circle. */
export function initials(name) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
