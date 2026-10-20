import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const photosDir = () => new Directory(Paths.document, 'photos');

/** Lets the user pick a photo, then COPIES it into the app's documents (the picker's URI is temporary). */
export async function pickProgressPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.7,
  });
  if (result.canceled || !result.assets[0]) return null;
  const dir = photosDir();
  if (!dir.exists) dir.create();
  const source = new File(result.assets[0].uri);
  const target = new File(dir, `${Date.now()}.jpg`);
  source.copy(target);
  return target.uri;
}

export function deletePhoto(uri: string | null) {
  if (!uri) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
