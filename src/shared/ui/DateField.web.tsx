import { useTheme } from '@/shared/theme/useTheme';
import type { DateFieldProps } from './DateField.types';

/** Local 'YYYY-MM-DDTHH:mm' string for <input type="datetime-local">. */
export const toInputValue = (d: Date) => {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

// On web, React Native Web runs on react-dom, so DOM elements are allowed in .web.tsx files.
export function DateField({ label, value, onChange, maximumDate }: DateFieldProps) {
  const t = useTheme();
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        fontFamily: 'system-ui',
        color: t.colors.textMuted,
        fontSize: 13,
      }}
    >
      {label}
      <input
        type="datetime-local"
        aria-label={label}
        value={toInputValue(value)}
        max={maximumDate ? toInputValue(maximumDate) : undefined}
        onChange={(e) => e.target.value && onChange(new Date(e.target.value))}
        style={{
          padding: 12,
          fontSize: 16,
          borderRadius: 12,
          border: `1.5px solid ${t.colors.border}`,
          background: t.colors.surface,
          color: t.colors.text,
        }}
      />
    </label>
  );
}
