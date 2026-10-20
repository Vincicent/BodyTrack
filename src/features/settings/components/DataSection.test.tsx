import { pickCsvText } from '@/features/export/pickCsvText';
import { shareCsv } from '@/features/export/shareCsv';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { weightRepository } from '@/features/weight/data/weightRepository';
import { makeMeasurement, makeWeight } from '@/test/factories';
import { renderWithProviders, screen, userEvent } from '@/test/render';
import { DataSection } from './DataSection';

jest.mock('@/features/export/pickCsvText', () => ({ pickCsvText: jest.fn() }));
jest.mock('@/features/export/shareCsv', () => ({ shareCsv: jest.fn() }));
jest.mock('@/features/weight/data/weightRepository', () => ({
  weightRepository: { listQuery: jest.fn(), addMany: jest.fn(), removeAll: jest.fn() },
}));
jest.mock('@/features/measurements/data/measurementRepository', () => ({
  measurementRepository: { listQuery: jest.fn(), addMany: jest.fn(), removeAll: jest.fn() },
}));
const weights = jest.mocked(weightRepository);
const measurements = jest.mocked(measurementRepository);

const pick = (text: string) => jest.mocked(pickCsvText).mockResolvedValue(text);

beforeEach(() => jest.clearAllMocks());

describe('DataSection', () => {
  it('exports weights AND measurements in one file', async () => {
    const user = userEvent.setup();
    weights.listQuery.mockReturnValue({ all: () => [makeWeight({ weightKg: 80 })] } as never);
    measurements.listQuery.mockReturnValue({
      all: () => [makeMeasurement({ site: 'waist', valueCm: 84 })],
    } as never);
    await renderWithProviders(<DataSection />);
    await user.press(screen.getByRole('button', { name: 'Export CSV' }));
    const [csv, fileName] = jest.mocked(shareCsv).mock.lastCall!;
    expect(csv).toMatch(/^type,date,site,value,note\n/);
    expect(csv).toContain(',,80,');
    expect(csv).toContain(',waist,84,');
    expect(fileName).toMatch(/^bodytrack-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it('imports both kinds of rows and says how many', async () => {
    const user = userEvent.setup();
    pick(
      'type,date,site,value,note\n' +
        'weight,2026-10-01T07:00:00.000Z,,80,\n' +
        'measurement,2026-10-01T07:00:00.000Z,waist,84,\n' +
        'measurement,2026-10-01T07:00:00.000Z,nose,4,',
    );
    await renderWithProviders(<DataSection />);
    await user.press(screen.getByRole('button', { name: 'Import CSV' }));
    expect(weights.addMany).toHaveBeenCalledWith([expect.objectContaining({ weightKg: 80 })]);
    expect(measurements.addMany).toHaveBeenCalledWith([
      expect.objectContaining({ site: 'waist', valueCm: 84 }),
    ]);
    expect(await screen.findByText('2 imported, 1 skipped')).toBeOnTheScreen();
  });

  it('refuses a file that is not a BodyTrack export', async () => {
    const user = userEvent.setup();
    pick('name,age\nAda,36');
    await renderWithProviders(<DataSection />);
    await user.press(screen.getByRole('button', { name: 'Import CSV' }));
    expect(await screen.findByText("This file isn't a BodyTrack export.")).toBeOnTheScreen();
    expect(weights.addMany).not.toHaveBeenCalled();
    expect(measurements.addMany).not.toHaveBeenCalled();
  });
});
