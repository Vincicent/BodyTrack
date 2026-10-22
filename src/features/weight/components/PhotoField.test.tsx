import { pickProgressPhoto } from '../data/photos';
import { fireEvent, renderWithProviders, screen, userEvent } from '@/test/render';
import { PhotoField } from './PhotoField';

let mockSupported = true;
jest.mock('../data/photos', () => ({
  get PHOTOS_SUPPORTED() {
    return mockSupported;
  },
  pickProgressPhoto: jest.fn(),
  photoUri: (stored: string) => `file:///documents/${stored}`,
}));
const pick = jest.mocked(pickProgressPhoto);

beforeEach(() => {
  mockSupported = true;
  jest.clearAllMocks();
});

describe('PhotoField', () => {
  it('offers to add a photo, and keeps the picked one', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    pick.mockResolvedValue('file:///cache/a.jpg');
    await renderWithProviders(<PhotoField value={null} onChange={onChange} />);
    await user.press(screen.getByRole('button', { name: 'Add photo' }));
    expect(onChange).toHaveBeenCalledWith({ picked: 'file:///cache/a.jpg' });
  });

  it('changes nothing when the user cancels the picker', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    pick.mockResolvedValue(null);
    await renderWithProviders(<PhotoField value={null} onChange={onChange} />);
    await user.press(screen.getByRole('button', { name: 'Add photo' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows a saved photo, which can be changed or removed', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await renderWithProviders(
      <PhotoField value={{ stored: 'photos/1.jpg' }} onChange={onChange} />,
    );
    expect(screen.getByLabelText('Progress photo')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Change photo' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Remove photo' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('says so when a photo cannot be opened', async () => {
    const onChange = jest.fn();
    pick.mockRejectedValue(new Error('unreadable'));
    await renderWithProviders(<PhotoField value={null} onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Add photo' }));
    expect(await screen.findByText(/Couldn't open this photo/)).toBeOnTheScreen();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('is hidden where photos are not supported (the web)', async () => {
    mockSupported = false;
    await renderWithProviders(<PhotoField value={null} onChange={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Add photo' })).toBeNull();
  });
});
