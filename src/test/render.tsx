import { i18n, type SupportedLanguage } from '@/shared/lib/i18n';
import { render, type RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';

type Options = RenderOptions & { language?: SupportedLanguage };

export async function renderWithProviders(
  ui: ReactElement,
  { language = 'en', ...options }: Options = {},
) {
  await i18n.changeLanguage(language);
  function Providers({ children }: { children: ReactNode }) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>; // lesson 10 adds the Redux store
  }
  return render(ui, { wrapper: Providers, ...options });
}
export * from '@testing-library/react-native';
