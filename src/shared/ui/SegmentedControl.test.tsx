import { renderWithProviders, screen, userEvent } from '@/test/render';
import { SegmentedControl } from './SegmentedControl';

it('marks the selected option and reports changes', async () => {
  const user = userEvent.setup();
  const onChange = jest.fn();
  await renderWithProviders(
    <SegmentedControl value="kg" options={['kg', 'lb'] as const} onChange={onChange} />,
  );
  expect(screen.getByRole('button', { name: 'kg' })).toBeSelected();
  await user.press(screen.getByRole('button', { name: 'lb' }));
  expect(onChange).toHaveBeenCalledWith('lb');
});
