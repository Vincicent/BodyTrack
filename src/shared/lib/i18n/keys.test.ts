import en from './en.json';
import fr from './fr.json';

const flatten = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
const normalise = (keys: string[]) =>
  [...new Set(keys.map((k) => k.replace(/_(zero|one|two|few|many|other)$/, '')))].sort();

it('French and English have the same keys', () => {
  expect(normalise(flatten(fr))).toEqual(normalise(flatten(en)));
});
