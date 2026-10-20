import * as DocumentPicker from 'expo-document-picker';
import { pickCsvText } from './pickCsvText';

jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({
  File: jest
    .fn()
    .mockImplementation((uri: string) => ({ text: () => Promise.resolve(`text of ${uri}`) })),
}));
const picker = jest.mocked(DocumentPicker.getDocumentAsync);

describe('pickCsvText (iOS/Android)', () => {
  it('reads the chosen file', async () => {
    picker.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///a.csv' }] } as never);
    await expect(pickCsvText()).resolves.toBe('text of file:///a.csv');
  });

  it('returns null when the user cancels', async () => {
    picker.mockResolvedValue({ canceled: true, assets: null } as never);
    await expect(pickCsvText()).resolves.toBeNull();
  });
});
