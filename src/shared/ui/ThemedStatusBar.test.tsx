import { StatusBar } from 'expo-status-bar';
import { render } from '@/test/render';
import { ThemePreferenceProvider } from '@/shared/theme/ThemePreference';
import { ThemedStatusBar } from './ThemedStatusBar';

jest.mock('expo-status-bar', () => ({ StatusBar: jest.fn(() => null) }));
const statusBar = jest.mocked(StatusBar);

describe('ThemedStatusBar', () => {
  beforeEach(() => statusBar.mockClear());

  it('uses dark icons on the light theme (visible on white headers)', async () => {
    await render(
      <ThemePreferenceProvider value="light">
        <ThemedStatusBar />
      </ThemePreferenceProvider>,
    );
    expect(statusBar.mock.lastCall?.[0]).toEqual({ style: 'dark' });
  });

  it('uses light icons on the dark theme', async () => {
    await render(
      <ThemePreferenceProvider value="dark">
        <ThemedStatusBar />
      </ThemePreferenceProvider>,
    );
    expect(statusBar.mock.lastCall?.[0]).toEqual({ style: 'light' });
  });
});
