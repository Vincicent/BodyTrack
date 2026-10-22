/** Web: no camera scanner (browser support is unreliable). The screen hides the button and keeps typed entry. */
export const CAN_SCAN = false;

export function BarcodeScanner(_props: {
  onScanned: (barcode: string) => void;
  onClose: () => void;
}) {
  return null;
}
