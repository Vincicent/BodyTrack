import { i18n, type SupportedLanguage } from '@/shared/lib/i18n';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { makeTestStore, type TestState } from './store';

type Options = RenderOptions & {
  language?: SupportedLanguage;
  preloadedState?: Partial<TestState>;
  store?: ReturnType<typeof makeTestStore>;
};

export async function renderWithProviders(
  ui: ReactElement,
  {
    language = 'en',
    preloadedState,
    store = makeTestStore(preloadedState),
    ...options
  }: Options = {},
) {
  await i18n.changeLanguage(language);
  function Providers({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
      </Provider>
    );
  }
  const result = await render(ui, { wrapper: Providers, ...options });
  return { store, ...result };
}
export * from '@testing-library/react-native';
