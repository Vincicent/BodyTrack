import * as DocumentPicker from 'expo-document-picker';

export const CSV_TYPES = ['text/csv', 'text/comma-separated-values', 'text/plain'];

/** Web: expo-file-system doesn't exist here; the picker gives the browser's own File object, which can read itself. */
export async function pickCsvText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: CSV_TYPES });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return asset.file ? asset.file.text() : (await fetch(asset.uri)).text();
}
