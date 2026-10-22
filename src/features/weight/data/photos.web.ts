// The web has no app documents folder to keep photos in: the feature is hidden there (PHOTOS_SUPPORTED = false).
// Entries on the web never have a photo, and a CSV backup never carries one, so these are never really called.
export const PHOTOS_SUPPORTED = false;

export async function pickProgressPhoto(): Promise<string | null> {
  return null;
}

export async function storePhoto(_pickedUri: string): Promise<string> {
  throw new Error('Progress photos are not available on the web');
}

export function photoUri(stored: string): string {
  return stored;
}

export function deletePhoto(_stored: string | null): void {}

export function deleteAllPhotos(): void {}
