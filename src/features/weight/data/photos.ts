import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { PHOTO_JPEG_QUALITY, photoResize } from '../domain/photo';

/** Progress photos need the device's file system: false on the web (photos.web.ts), where the feature is hidden. */
export const PHOTOS_SUPPORTED = true;

const FOLDER = 'photos';
const photosDir = () => new Directory(Paths.document, FOLDER);

/**
 * Lets the user pick a photo from their library, then shrinks it (long side 1280 px, JPEG 70%).
 * Returns a TEMPORARY file (cache): it becomes the entry's photo only when the form is saved (storePhoto), so
 * cancelling the form leaves nothing behind. Re-encoding also drops the original's metadata (EXIF, location).
 * The system photo picker needs no permission on Android 13+ and iOS 14+.
 */
export async function pickProgressPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  const asset = result.canceled ? null : result.assets[0];
  if (!asset) return null;
  const context = ImageManipulator.manipulate(asset.uri);
  const resize = photoResize(asset.width, asset.height);
  if (resize) context.resize(resize);
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ compress: PHOTO_JPEG_QUALITY, format: SaveFormat.JPEG });
  return saved.uri;
}

/** Moves a picked temporary photo into the app's documents. Returns its path relative to them ("photos/….jpg"). */
export async function storePhoto(pickedUri: string): Promise<string> {
  const dir = photosDir();
  if (!dir.exists) dir.create();
  const name = `${Date.now()}.jpg`;
  await new File(pickedUri).move(new File(dir, name));
  return `${FOLDER}/${name}`;
}

/** The full URI to display a stored photo (rebuilt each time: the app's folder can move between updates). */
export function photoUri(stored: string): string {
  return new File(Paths.document, stored).uri;
}

export function deletePhoto(stored: string | null): void {
  if (!stored) return;
  const file = new File(Paths.document, stored);
  if (file.exists) file.delete();
}

/** "Delete all data": every photo goes with the entries. */
export function deleteAllPhotos(): void {
  const dir = photosDir();
  if (dir.exists) dir.delete();
}
