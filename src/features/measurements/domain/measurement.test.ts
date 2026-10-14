import { makeMeasurement } from '@/test/factories';
import { latestBySite } from './measurement';

describe('latestBySite', () => {
  it('keeps the most recent entry per site', () => {
    const oldWaist = makeMeasurement({
      site: 'waist',
      measuredAt: new Date('2026-09-01T08:00:00Z'),
    });
    const newWaist = makeMeasurement({
      site: 'waist',
      measuredAt: new Date('2026-10-01T08:00:00Z'),
    });
    const hips = makeMeasurement({ site: 'hips' });
    expect(latestBySite([newWaist, oldWaist, hips])).toEqual({ waist: newWaist, hips });
  });
  it('omits sites without entries', () => expect(latestBySite([])).toEqual({}));
});
