import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

export const CSV_TYPES = ['text/csv', 'text/comma-separated-values', 'text/plain'];

/** Lets the user choose a CSV file and returns its text (null if they cancel). iOS/Android: read with expo-file-system. */
export async function pickCsvText(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: CSV_TYPES });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return null;
  return new File(asset.uri).text();
}
