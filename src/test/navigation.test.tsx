import NotFoundScreen from '@/app/+not-found';
import EditEntryScreen from '@/app/entry/[id]';
import { router } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

// With RNTL v14, `render` is async. renderRouter attaches its helpers (getPathname…) to the returned object,
// so keep a reference to it and `await` it, instead of `await renderRouter(...)` directly.
describe('navigation', () => {
  it('opens the add-entry screen', async () => {
    const app = renderRouter(
      { index: () => <Text>Dashboard</Text>, 'entry/new': () => <Text>Add weight</Text> },
      { initialUrl: '/' },
    );
    await app;
    expect(app.getPathname()).toBe('/');

    await act(() => router.push('/entry/new'));

    expect(app.getPathname()).toBe('/entry/new');
    expect(screen.getByText('Add weight')).toBeOnTheScreen();
  });

  it('reads the id param from a deep link', async () => {
    await renderRouter({ 'entry/[id]': EditEntryScreen }, { initialUrl: '/entry/42' });
    expect(screen.getByText('Edit entry #42')).toBeOnTheScreen();
  });

  it('shows not-found for unknown URLs', async () => {
    await renderRouter({ index: () => null, '+not-found': NotFoundScreen }, { initialUrl: '/nope' });
    expect(screen.getByText("This screen doesn't exist.")).toBeOnTheScreen();
  });
});