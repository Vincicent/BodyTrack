import { makeMeasurement, makeWeight } from '@/test/factories';
import { BACKUP_HEADER, backupToCsv, parseBackupCsv, parseCsvLine } from './csv';

const day = (n: number) => new Date(Date.UTC(2026, 9, n, 7));

describe('backupToCsv', () => {
  it('puts weights and measurements in one file, newest first', () => {
    const csv = backupToCsv(
      [
        makeWeight({ measuredAt: day(1), weightKg: 80 }),
        makeWeight({ measuredAt: day(3), weightKg: 79.5 }),
      ],
      [makeMeasurement({ measuredAt: day(2), site: 'hips', valueCm: 98.5 })],
    );
    expect(csv.split('\n')).toEqual([
      BACKUP_HEADER,
      `weight,${day(3).toISOString()},,79.5,`,
      `measurement,${day(2).toISOString()},hips,98.5,`,
      `weight,${day(1).toISOString()},,80,`,
    ]);
  });

  it('keeps commas and quotes in notes, and puts multi-line notes on one line', () => {
    const csv = backupToCsv([makeWeight({ note: 'after "long" run, tired\nreally' })], []);
    const [, line] = csv.split('\n');
    expect(csv.split('\n')).toHaveLength(2);
    expect(parseCsvLine(line!)[4]).toBe('after "long" run, tired really');
  });
});

describe('parseBackupCsv', () => {
  it('survives a round trip: same weights and measurements back', () => {
    const weights = [makeWeight({ measuredAt: day(3), weightKg: 79.5, note: 'a, "b"' })];
    const measurements = [
      makeMeasurement({ measuredAt: day(2), site: 'waist', valueCm: 84 }),
      makeMeasurement({ measuredAt: day(2), site: 'armL', valueCm: 31.5, note: 'left' }),
    ];
    const backup = parseBackupCsv(backupToCsv(weights, measurements));
    expect(backup).toEqual({
      weights: [{ measuredAt: day(3), weightKg: 79.5, note: 'a, "b"' }],
      measurements: [
        { measuredAt: day(2), site: 'waist', valueCm: 84, note: null },
        { measuredAt: day(2), site: 'armL', valueCm: 31.5, note: 'left' },
      ],
      skipped: 0,
    });
  });

  it('still imports the old weights-only export (date,weight_kg,note)', () => {
    const backup = parseBackupCsv('date,weight_kg,note\n2026-10-01T07:00:00.000Z,72.5,old file');
    expect(backup?.weights).toEqual([
      { measuredAt: new Date('2026-10-01T07:00:00.000Z'), weightKg: 72.5, note: 'old file' },
    ]);
    expect(backup?.measurements).toEqual([]);
  });

  it('skips and counts invalid rows, keeps the valid ones', () => {
    const at = day(1).toISOString();
    const backup = parseBackupCsv(
      [
        BACKUP_HEADER,
        `weight,${at},,80,`, // valid
        `measurement,${at},waist,84,`, // valid
        `photo,${at},,1,`, // unknown type
        `measurement,${at},nose,4,`, // unknown site
        `measurement,${at},waist,900,`, // out of range (5–300 cm)
        `weight,${at},,10,`, // out of range (20–400 kg)
        'weight,not-a-date,,80,', // bad date
      ].join('\n'),
    );
    expect(backup?.weights).toHaveLength(1);
    expect(backup?.measurements).toHaveLength(1);
    expect(backup?.skipped).toBe(5);
  });

  it('accepts files saved by Excel (byte order mark, Windows line endings)', () => {
    const csv = `﻿${BACKUP_HEADER}\r\nweight,${day(1).toISOString()},,80,\r\n`;
    expect(parseBackupCsv(csv)?.weights).toHaveLength(1);
  });

  it('returns null for a file that is not a BodyTrack export', () => {
    expect(parseBackupCsv('name,age\nAda,36')).toBeNull();
    expect(parseBackupCsv('')).toBeNull();
  });
});
