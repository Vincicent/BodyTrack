import { useCameraPermissions } from 'expo-camera';
import { Linking } from 'react-native';
import { act, renderWithProviders, screen, userEvent } from '@/test/render';
import { BarcodeScanner } from './BarcodeScanner';

// The camera can't run in Jest: keep the props CameraView receives, so the test can "scan" through them.
let mockCameraProps: { onBarcodeScanned?: (r: { data: string; type: string }) => void } = {};
jest.mock('expo-camera', () => ({
  useCameraPermissions: jest.fn(),
  CameraView: (props: typeof mockCameraProps) => {
    mockCameraProps = props;
    return null;
  },
}));
const permissions = jest.mocked(useCameraPermissions);
const permission = (granted: boolean, canAskAgain = true) =>
  permissions.mockReturnValue([{ granted, canAskAgain } as never, jest.fn(), jest.fn()]);
const scan = (data: string) =>
  act(async () => mockCameraProps.onBarcodeScanned?.({ data, type: 'ean13' }));

beforeEach(() => {
  jest.clearAllMocks();
  mockCameraProps = {};
});

describe('BarcodeScanner', () => {
  it('reports a barcode once, although the camera sees it many times', async () => {
    permission(true);
    const onScanned = jest.fn();
    await renderWithProviders(<BarcodeScanner onScanned={onScanned} onClose={jest.fn()} />);
    await scan('3017624010701');
    await scan('3017624010701');
    await scan('3017624010701');
    expect(onScanned).toHaveBeenCalledTimes(1);
    expect(onScanned).toHaveBeenCalledWith('3017624010701');
  });

  it('ignores what is not a food barcode', async () => {
    permission(true);
    const onScanned = jest.fn();
    await renderWithProviders(<BarcodeScanner onScanned={onScanned} onClose={jest.fn()} />);
    await scan('https://example.com');
    expect(onScanned).not.toHaveBeenCalled();
  });

  it('shows the system camera dialog straight away, with no in-app step before it', async () => {
    const request = jest.fn().mockResolvedValue({ granted: true });
    permissions.mockReturnValue([
      { granted: false, canAskAgain: true } as never,
      request,
      jest.fn(),
    ]);
    const onClose = jest.fn();
    await renderWithProviders(<BarcodeScanner onScanned={jest.fn()} onClose={onClose} />);
    expect(request).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('goes back to typing when the camera is refused in the dialog', async () => {
    const request = jest.fn().mockResolvedValue({ granted: false });
    permissions.mockReturnValue([
      { granted: false, canAskAgain: true } as never,
      request,
      jest.fn(),
    ]);
    const onClose = jest.fn();
    await renderWithProviders(<BarcodeScanner onScanned={jest.fn()} onClose={onClose} />);
    expect(onClose).toHaveBeenCalled();
  });

  it('explains a refusal for good, opens the Settings or cancels', async () => {
    const user = userEvent.setup();
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    permission(false, false);
    await renderWithProviders(<BarcodeScanner onScanned={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText('Camera access is off for BodyTrack.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Open settings' }));
    expect(openSettings).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Close the camera' })).toBeNull(); // no camera is open
  });

  it('a refusal for good can be dismissed with Cancel', async () => {
    const user = userEvent.setup();
    permission(false, false);
    const onClose = jest.fn();
    await renderWithProviders(<BarcodeScanner onScanned={jest.fn()} onClose={onClose} />);
    await user.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('the open camera can be closed', async () => {
    const user = userEvent.setup();
    permission(true);
    const onClose = jest.fn();
    await renderWithProviders(<BarcodeScanner onScanned={jest.fn()} onClose={onClose} />);
    await user.press(screen.getByRole('button', { name: 'Close the camera' }));
    expect(onClose).toHaveBeenCalled();
  });
});
