import { isValidBarcode } from './product';

/** The barcode formats printed on food packaging (the camera ignores QR codes and the rest). */
export const FOOD_BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e'] as const;

/**
 * The camera reports the same barcode many times per second. Accept a scan only when it's a valid barcode AND not the
 * one just accepted; otherwise one scan would start dozens of lookups. Returns the barcode to look up, or null.
 */
export function acceptScan(data: string, lastAccepted: string | null): string | null {
  const barcode = data.trim();
  if (!isValidBarcode(barcode) || barcode === lastAccepted) return null;
  return barcode;
}
