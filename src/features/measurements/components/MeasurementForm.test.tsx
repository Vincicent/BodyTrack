import { renderWithProviders, screen, userEvent } from '@/test/render';
import { MeasurementForm } from './MeasurementForm';

jest.mock('@/shared/ui/DateField', () => ({ DateField: () => null }));

describe('MeasurementForm', () => {
  it('asks for at least one measurement', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    await renderWithProviders(<MeasurementForm unit="cm" onSubmit={onSubmit} />);
    await user.press(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Fill in at least one measurement')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits the filled sites', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(<MeasurementForm unit="cm" onSubmit={onSubmit} />);
    await user.type(screen.getByLabelText('Waist'), '84');
    await user.type(screen.getByLabelText('Hips'), '98,5');
    await user.press(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit.mock.calls[0][0].values).toMatchObject({ waist: 84, hips: 98.5 });
  });
});
