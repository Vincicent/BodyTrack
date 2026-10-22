/**
 * Progress photos: pure rules (no files, no React), so they are unit-tested.
 *
 * Size: a phone photo is 12 MP and 3 to 5 MB. Scaled to 1280 px on its long side and saved as JPEG at 70%, it weighs
 * about 150 to 250 KB and stays sharp on a phone screen, even full width: enough to compare your shape over months.
 */
export const PHOTO_MAX_SIDE = 1280;
export const PHOTO_JPEG_QUALITY = 0.7;

/** The resize to apply (only the long side: the other follows the ratio), or null when the photo is already small. */
export function photoResize(
  width: number,
  height: number,
  maxSide = PHOTO_MAX_SIDE,
): { width: number } | { height: number } | null {
  if (Math.max(width, height) <= maxSide) return null;
  return width >= height ? { width: maxSide } : { height: maxSide };
}

/**
 * The photo in the weight form:
 * - `stored`: already saved with the entry, a path relative to the app's documents ("photos/….jpg");
 * - `picked`: just chosen and shrunk, still a temporary file (cache) until the form is saved.
 * Relative paths, not full URIs: on iOS the app's folder changes path on every update, a full URI would break.
 */
export type PhotoValue = { stored: string } | { picked: string } | null;

export type PhotoPlan = {
  /** A picked temporary file to move into the app's photos, when the entry is saved. */
  store: string | null;
  /** What happens to the entry's photo column: `keep` it, or set it (a new path, or null to remove it). */
  column: 'keep' | 'set';
  /** The previous file to delete once the entry is saved (replaced or removed). */
  remove: string | null;
};

/** What to do with files when the form is saved, given the entry's photo before (`previous`) and in the form. */
export function planPhotoChange(previous: string | null, next: PhotoValue): PhotoPlan {
  if (next && 'stored' in next && next.stored === previous) {
    return { store: null, column: 'keep', remove: null };
  }
  if (next && 'picked' in next) return { store: next.picked, column: 'set', remove: previous };
  // removed (or, defensively, a stored path that isn't this entry's: never delete a file we didn't replace)
  return { store: null, column: 'set', remove: next ? null : previous };
}
