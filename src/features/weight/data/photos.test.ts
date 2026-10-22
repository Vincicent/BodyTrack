import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { deleteAllPhotos, deletePhoto, photoUri, pickProgressPhoto, storePhoto } from './photos';

// A fake file system: paths that exist, and what was mockMoved or mockDeleted
const mockExisting = new Set<string>();
const mockMoved: [string, string][] = [];
const mockDeleted: string[] = [];
jest.mock('expo-file-system', () => {
  const join = (...parts: (string | { uri: string })[]) =>
    parts.map((p) => (typeof p === 'string' ? p : p.uri)).join('/');
  class Entry {
    uri: string;
    constructor(...parts: (string | { uri: string })[]) {
      this.uri = join(...parts);
    }
    get exists() {
      return mockExisting.has(this.uri);
    }
    delete() {
      mockDeleted.push(this.uri);
    }
  }
  return {
    Paths: { document: { uri: 'file:///docs' } },
    Directory: class extends Entry {
      create() {
        mockExisting.add(this.uri);
      }
    },
    File: class extends Entry {
      async move(to: { uri: string }) {
        mockMoved.push([this.uri, to.uri]);
      }
    },
  };
});
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
const mockResize = jest.fn();
const mockSaveAsync = jest.fn(async () => ({ uri: 'file:///cache/small.jpg' }));
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: jest.fn(() => ({
      resize: mockResize,
      renderAsync: async () => ({ saveAsync: mockSaveAsync }),
    })),
  },
}));

const library = jest.mocked(ImagePicker.launchImageLibraryAsync);
const picked = (width: number, height: number) =>
  library.mockResolvedValue({
    canceled: false,
    assets: [{ uri: 'file:///picker/IMG_1.HEIC', width, height }],
  } as never);

beforeEach(() => {
  jest.clearAllMocks();
  mockExisting.clear();
  mockMoved.length = 0;
  mockDeleted.length = 0;
});

describe('pickProgressPhoto', () => {
  it('shrinks a phone photo to 1280 px and saves it as a 70% JPEG', async () => {
    picked(3024, 4032);
    await expect(pickProgressPhoto()).resolves.toBe('file:///cache/small.jpg');
    expect(library).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
    expect(ImageManipulator.manipulate).toHaveBeenCalledWith('file:///picker/IMG_1.HEIC');
    expect(mockResize).toHaveBeenCalledWith({ height: 1280 });
    expect(mockSaveAsync).toHaveBeenCalledWith({ compress: 0.7, format: SaveFormat.JPEG });
  });

  it('re-encodes a small photo without enlarging it', async () => {
    picked(800, 600);
    await pickProgressPhoto();
    expect(mockResize).not.toHaveBeenCalled();
    expect(mockSaveAsync).toHaveBeenCalled();
  });

  it('returns null when the user cancels', async () => {
    library.mockResolvedValue({ canceled: true, assets: null } as never);
    await expect(pickProgressPhoto()).resolves.toBeNull();
    expect(ImageManipulator.manipulate).not.toHaveBeenCalled();
  });
});

describe('stored photos', () => {
  it('moves the picked file into the photos folder and returns a relative path', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1792700000000);
    await expect(storePhoto('file:///cache/small.jpg')).resolves.toBe('photos/1792700000000.jpg');
    expect(mockExisting.has('file:///docs/photos')).toBe(true); // folder created on first use
    expect(mockMoved).toEqual([
      ['file:///cache/small.jpg', 'file:///docs/photos/1792700000000.jpg'],
    ]);
  });

  it('rebuilds the full URI from the relative path', () =>
    expect(photoUri('photos/1.jpg')).toBe('file:///docs/photos/1.jpg'));

  it('deletes a photo file, and ignores a missing one', () => {
    mockExisting.add('file:///docs/photos/1.jpg');
    deletePhoto('photos/1.jpg');
    deletePhoto('photos/gone.jpg');
    deletePhoto(null);
    expect(mockDeleted).toEqual(['file:///docs/photos/1.jpg']);
  });

  it('delete all removes the whole photos folder', () => {
    mockExisting.add('file:///docs/photos');
    deleteAllPhotos();
    expect(mockDeleted).toEqual(['file:///docs/photos']);
  });
});
