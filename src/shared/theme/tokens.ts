export const palette = {
  indigo400: '#818CF8',
  indigo600: '#4F46E5',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  gray950: '#0B0F19',
  green400: '#4ADE80',
  green700: '#15803D',
  red400: '#F87171',
  red600: '#DC2626',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 6, md: 12, lg: 20, full: 999 } as const;
export const fontSize = { sm: 13, md: 16, lg: 20, xl: 28, xxl: 40 } as const;

type ThemeColors = Record<
  | 'background'
  | 'surface'
  | 'text'
  | 'textMuted'
  | 'primary'
  | 'onPrimary'
  | 'border'
  | 'success'
  | 'danger',
  string
>;

// Every text colour below has a contrast ratio ≥ 4.5:1 on `background` and `surface` (WCAG AA).
const light: ThemeColors = {
  background: palette.gray50,
  surface: palette.white,
  text: palette.gray900,
  textMuted: palette.gray500,
  primary: palette.indigo600,
  onPrimary: palette.white,
  border: palette.gray200,
  success: palette.green700,
  danger: palette.red600,
};
const dark: ThemeColors = {
  background: palette.gray950,
  surface: palette.gray900,
  text: palette.gray50,
  textMuted: palette.gray400,
  primary: palette.indigo400,
  onPrimary: palette.gray950,
  border: palette.gray700,
  success: palette.green400,
  danger: palette.red400,
};
export const themes = { light, dark };
export type ColorSchemeName = keyof typeof themes;
export type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
};
