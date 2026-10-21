import { renderWithProviders, screen, userEvent } from '@/test/render';
import { ErrorScreen } from './ErrorScreen';

it('shows the error and retries', async () => {
  const user = userEvent.setup();
  const retry = jest.fn();
  await renderWithProviders(<ErrorScreen error={new Error('boom')} retry={retry} />);
  expect(screen.getByRole('header', { name: 'Something went wrong' })).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalled();
});
