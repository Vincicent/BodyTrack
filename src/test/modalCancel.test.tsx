import { router, Stack, type Href } from 'expo-router';
import { act, fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import NewEntryScreen from '@/app/entry/new';
import NewMeasurementScreen from '@/app/measurement/new';
import { measurementRepository } from '@/features/measurements/data/measurementRepository';
import { weightRepository } from '@/features/weight/data/weightRepository';
import '@/shared/lib/i18n';
import { makeTestStore } from './store';

jest.mock('@/shared/ui/DateField', () => ({ DateField: () => null })); // native picker: tested on devices
jest.mock('@/features/measurements/data/measurementRepository', () => ({
  measurementRepository: { addMany: jest.fn() },
}));
jest.mock('@/features/weight/data/weightRepository', () => ({
  weightRepository: { add: jest.fn(), update: jest.fn() },
}));

const store = makeTestStore();
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

// The real add screens inside a real Stack: their header is rendered, so its "Cancel" button can be pressed.
describe.each<[string, Href & string, string, () => ReactNode]>([
  ['add weight', '/entry/new', 'entry/new', NewEntryScreen],
  ['add measurements', '/measurement/new', 'measurement/new', NewMeasurementScreen],
])('the %s modal', (_, url, route, Component) => {
  it('has a Cancel button that closes it without saving', async () => {
    const app = renderRouter(
      {
        _layout: () => <Stack />,
        index: () => <Text>Dashboard</Text>,
        [route]: Component,
      },
      { initialUrl: '/', wrapper },
    );
    await app;
    await act(() => router.push(url));
    expect(app.getPathname()).toBe(url);

    await act(async () => fireEvent.press(screen.getByRole('button', { name: 'Cancel' })));

    expect(app.getPathname()).toBe('/');
    expect(measurementRepository.addMany).not.toHaveBeenCalled();
    expect(weightRepository.add).not.toHaveBeenCalled();
  });
});
