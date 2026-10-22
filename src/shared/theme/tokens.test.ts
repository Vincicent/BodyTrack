import { themes } from './tokens';

/** WCAG 2 relative luminance and contrast ratio. */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

const TEXT_COLOURS = ['text', 'textMuted', 'primary', 'success', 'warning', 'danger'] as const;

describe.each(Object.entries(themes))('%s theme', (_, colors) => {
  it.each(TEXT_COLOURS)('%s is readable on background and surface (WCAG AA, ≥ 4.5:1)', (name) => {
    expect(contrast(colors[name], colors.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors[name], colors.surface)).toBeGreaterThanOrEqual(4.5);
  });
});
