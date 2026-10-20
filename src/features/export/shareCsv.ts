import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/** Writes the CSV to the cache folder and opens the native share sheet. */
export async function shareCsv(csv: string, fileName: string) {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
  });
}
