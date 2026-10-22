import { acceptScan } from './scan';

describe('acceptScan', () => {
  it('accepts a valid barcode', () => {
    expect(acceptScan(' 3017624010701 ', null)).toBe('3017624010701');
  });

  it('ignores the same barcode reported again by the camera', () => {
    expect(acceptScan('3017624010701', '3017624010701')).toBeNull();
  });

  it('accepts a different barcode afterwards', () => {
    expect(acceptScan('5449000000996', '3017624010701')).toBe('5449000000996');
  });

  it('ignores anything that is not a food barcode (a URL from a QR code, a partial read)', () => {
    expect(acceptScan('https://example.com', null)).toBeNull();
    expect(acceptScan('3017', null)).toBeNull();
  });
});
