const STALE_AFTER_DAYS = 30;

/** Days since a listing's availability was last reconfirmed (falls back to when it was submitted). */
export function daysSincePosted(listing) {
  const from = listing?.lastConfirmedDate ?? listing?.submittedDate;
  if (!from) return 0;
  const ms = Date.now() - new Date(from).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

// Only live (approved) listings go stale — a pending/rejected/flagged listing isn't
// showing on the site yet, so "still available?" doesn't apply to it.
export function isStaleListing(listing) {
  return listing?.status === "approved" && daysSincePosted(listing) > STALE_AFTER_DAYS;
}
