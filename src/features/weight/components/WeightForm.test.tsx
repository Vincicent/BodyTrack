import { renderWithProviders, screen, userEvent } from '@/test/render';
import { WeightForm } from './WeightForm';

jest.mock('@/shared/ui/DateField', () => ({ DateField: () => null })); // native picker: tested on devices

describe('WeightForm', () => {
  it('submits a comma decimal as a number', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(<WeightForm unit="kg" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('Weight'), '72,5');
    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ weight: 72.5 });
  });

  it('shows an error and does not submit when empty', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    await renderWithProviders(<WeightForm unit="kg" onSubmit={onSubmit} />);

    await user.press(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Required')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('translates errors', async () => {
    const user = userEvent.setup();
    await renderWithProviders(<WeightForm unit="kg" onSubmit={jest.fn()} />, { language: 'fr' });
    await user.press(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByText('Obligatoire')).toBeOnTheScreen();
  });

  it('pre-fills values in edit mode', async () => {
    await renderWithProviders(
      <WeightForm unit="kg" defaultValues={{ weight: '80' }} onSubmit={jest.fn()} />,
    );
    expect(screen.getByLabelText('Weight')).toHaveDisplayValue('80');
  });
});
