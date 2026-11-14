/** Listing validation (S-01, Shawn). */
export function validateListing(d) {
  const e = {};
  if (!d.title || d.title.trim().length < 10) e.title = 'Use at least 10 characters.';
  if (!(+d.qty >= 1)) e.qty = 'Enter 1 or more.';
  if (!d.location || d.location.trim().length < 3) e.location = 'Add a town and postcode district.';
  if (!d.description || d.description.trim().length < 40)
    e.description = `Add a bit more detail (${(d.description || '').trim().length}/40 characters).`;
  return e;
}

/** Public cards show the town only. */
export const town = (loc) =>
  String(loc || '')
    .split(',')[0]
    .trim() || 'Location not set';
