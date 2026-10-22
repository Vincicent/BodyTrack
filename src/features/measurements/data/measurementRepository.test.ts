import { createTestDb } from '@/test/testDb';
import { createMeasurementRepository } from './measurementRepository';

jest.mock('@/shared/db/client', () => ({ getDb: jest.fn() }));

const valid = {
  measuredAt: new Date('2026-10-01T08:00:00Z'),
  site: 'waist' as const,
  valueCm: 84,
  note: null,
};

describe('measurementRepository', () => {
  let repo: ReturnType<typeof createMeasurementRepository>;
  beforeEach(() => {
    const db = createTestDb();
    repo = createMeasurementRepository(() => db);
  });

  it('adds several rows at once and filters by site', () => {
    repo.addMany([valid, { ...valid, site: 'hips', valueCm: 98 }]);
    expect(repo.listQuery().all()).toHaveLength(2);
    expect(repo.listQuery('hips').all()).toEqual([expect.objectContaining({ valueCm: 98 })]);
  });

  it('inserts nothing if one row is invalid (transaction rollback)', () => {
    expect(() => repo.addMany([valid, { ...valid, valueCm: null as unknown as number }])).toThrow();
    expect(repo.listQuery().all()).toHaveLength(0);
  });

  it('finds one measurement by id, and nothing for an unknown id', () => {
    const [waist] = repo.addMany([valid]);
    expect(repo.getById(waist!.id)).toEqual(
      expect.objectContaining({ site: 'waist', valueCm: 84 }),
    );
    expect(repo.getById(999)).toBeUndefined();
  });

  it('updates the value and date of one measurement, and only that one', () => {
    const [waist, hips] = repo.addMany([valid, { ...valid, site: 'hips', valueCm: 98 }]);
    const later = new Date('2026-10-02T08:00:00Z');
    repo.update(waist!.id, { valueCm: 82.5, measuredAt: later });
    expect(repo.getById(waist!.id)).toEqual(
      expect.objectContaining({ valueCm: 82.5, measuredAt: later, site: 'waist' }),
    );
    expect(repo.getById(hips!.id)?.valueCm).toBe(98);
  });

  it('removes one measurement', () => {
    const [waist] = repo.addMany([valid, { ...valid, site: 'hips', valueCm: 98 }]);
    repo.remove(waist!.id);
    expect(repo.listQuery().all()).toEqual([expect.objectContaining({ site: 'hips' })]);
  });

  it('deletes every measurement ("Delete all data")', () => {
    repo.addMany([valid, { ...valid, site: 'hips', valueCm: 98 }]);
    repo.removeAll();
    expect(repo.listQuery().all()).toHaveLength(0);
  });
});
