import { createTestDb } from '@/test/testDb';
import { createWeightRepository } from './weightRepository';

jest.mock('@/shared/db/client', () => ({ getDb: jest.fn() })); // the app's expo-sqlite DB is never opened in tests

describe('weightRepository', () => {
  let repo: ReturnType<typeof createWeightRepository>;
  beforeEach(() => {
    const db = createTestDb();
    repo = createWeightRepository(() => db);
  });

  it('adds an entry and lists it', () => {
    const added = repo.add({
      measuredAt: new Date('2026-10-01T08:00:00Z'),
      weightKg: 72.5,
      note: null,
    });
    expect(added.id).toBeGreaterThan(0);
    expect(repo.listQuery().all()).toEqual([expect.objectContaining({ weightKg: 72.5 })]);
  });

  it('lists newest first', () => {
    repo.add({ measuredAt: new Date('2026-10-01T08:00:00Z'), weightKg: 73, note: null });
    repo.add({ measuredAt: new Date('2026-10-05T08:00:00Z'), weightKg: 72, note: null });
    expect(
      repo
        .listQuery()
        .all()
        .map((e) => e.weightKg),
    ).toEqual([72, 73]);
  });

  it('updates an entry', () => {
    const { id } = repo.add({ measuredAt: new Date(), weightKg: 70, note: null });
    repo.update(id, { weightKg: 69.5 });
    expect(repo.getById(id)?.weightKg).toBe(69.5);
  });

  it('removes an entry', () => {
    const { id } = repo.add({ measuredAt: new Date(), weightKg: 70, note: null });
    repo.remove(id);
    expect(repo.getById(id)).toBeUndefined();
  });
});
