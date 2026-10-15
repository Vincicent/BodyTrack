import { weightFormSchema } from './weightForm';

const NOW = new Date('2026-10-12T10:00:00Z');
beforeEach(() => jest.useFakeTimers({ now: NOW }));
afterEach(() => jest.useRealTimers());

const parse = (weight: string, measuredAt = NOW) =>
  weightFormSchema.safeParse({ weight, measuredAt });
const firstError = (r: ReturnType<typeof parse>) => (r.success ? null : r.error.issues[0]?.message);

describe('weightFormSchema', () => {
  it.each(['72,5', '72.5', ' 72.5 '])('parses %p as 72.5', (input) => {
    const r = parse(input);
    expect(r.success && r.data.weight).toBe(72.5);
  });
  it('requires a value', () => expect(firstError(parse(''))).toBe('errors.required'));
  it('rejects text', () => expect(firstError(parse('abc'))).toBe('errors.notANumber'));
  it('rejects negatives', () => expect(firstError(parse('-3'))).toBe('errors.positive'));
  it('rejects a date tomorrow', () =>
    expect(firstError(parse('70', new Date('2026-10-13T10:00:00Z')))).toBe('errors.futureDate'));
  it('accepts now', () => expect(parse('70').success).toBe(true));
});
