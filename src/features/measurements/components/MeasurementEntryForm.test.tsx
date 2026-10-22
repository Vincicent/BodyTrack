import { renderWithProviders, screen, userEvent } from '@/test/render';
import { MeasurementEntryForm } from './MeasurementEntryForm';

jest.mock('@/shared/ui/DateField', () => ({ DateField: () => null })); // native picker: tested on devices

const measuredAt = new Date('2026-10-01T08:00:00Z');

describe('MeasurementEntryForm', () => {
  it('pre-fills the measurement and submits the corrected value as a number', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    await renderWithProviders(
      <MeasurementEntryForm
        site="calfL"
        unit="cm"
        defaultValues={{ value: '37', measuredAt }}
        onSubmit={onSubmit}
      />,
    );
    const field = screen.getByLabelText('Calf (L)');
    expect(field).toHaveDisplayValue('37');
    await user.clear(field);
    await user.type(field, '36,5');
    await user.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({ value: 36.5, measuredAt });
  });

  it('won’t save an empty value (delete the measurement instead), in French too', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    await renderWithProviders(
      <MeasurementEntryForm
        site="waist"
        unit="cm"
        defaultValues={{ value: '84', measuredAt }}
        onSubmit={onSubmit}
      />,
      { language: 'fr' },
    );
    await user.clear(screen.getByLabelText('Taille'));
    await user.press(screen.getByRole('button', { name: 'Enregistrer les modifications' }));
    expect(await screen.findByText('Obligatoire')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
