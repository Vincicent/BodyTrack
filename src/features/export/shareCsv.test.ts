import * as Sharing from 'expo-sharing';
import { shareCsv } from './shareCsv';

const written: string[] = [];
jest.mock('expo-file-system', () => ({
  Paths: { cache: 'file:///cache' },
  File: jest.fn().mockImplementation((dir: string, name: string) => ({
    uri: `${dir}/${name}`,
    exists: false,
    create: jest.fn(),
    delete: jest.fn(),
    write: (content: string) => written.push(content),
  })),
}));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));

it('writes the CSV and opens the share sheet', async () => {
  await shareCsv('date,weight_kg,note', 'bodytrack.csv');
  expect(written).toEqual(['date,weight_kg,note']);
  expect(Sharing.shareAsync).toHaveBeenCalledWith(
    'file:///cache/bodytrack.csv',
    expect.objectContaining({ mimeType: 'text/csv' }),
  );
});
