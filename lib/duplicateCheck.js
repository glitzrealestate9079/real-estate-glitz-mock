const PRICE_TOLERANCE = 0.05;

/**
 * Flags existing listings that look like the same property posted again — same city, same
 * property type, and a price within 5% (duplicate re-posts commonly round the price or nudge it
 * slightly rather than repeating it exactly). Heuristic, not an exact match.
 */
export function findPossibleDuplicates(listings, candidate, excludeId) {
  const city = (candidate?.city ?? "").trim().toLowerCase();
  const price = Number(candidate?.price);
  if (!city || !candidate?.propertyType || !price) return [];

  return listings.filter((l) => {
    if (l.id === excludeId) return false;
    if ((l.city ?? "").trim().toLowerCase() !== city) return false;
    if (l.propertyType !== candidate.propertyType) return false;
    return Math.abs(l.price - price) / price <= PRICE_TOLERANCE;
  });
}
