import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { PreloadedState } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import axios from 'config/axios';
import { RootState, setupStore } from 'config/store';
import { lightTheme } from 'config/theme';
import '@testing-library/jest-dom/extend-expect';
// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
}

// eslint-disable-next-line import/prefer-default-export
export const renderWithProviders = async (
  ui: React.ReactElement,
  { preloadedState = {}, ...renderOptions }: ExtendedRenderOptions = {}
) => {
  const queryClient = new QueryClient();
  await axios.post('user/reset');
  const store = setupStore(preloadedState);
  vi.mock('redux-persist', async (importOriginal) => {
    const mod = await importOriginal<typeof import('redux-persist')>();
    return {
      ...mod,
      getStoredState: async () => ({
        settings: {
          theme: 'dark',
          showLockedCourses: true,
          showMarks: true,
          showWarnings: true,
          token: 'token' // force token to be dummy
        }
      })
    };
  });
  // eslint-disable-next-line @typescript-eslint/ban-types
  const Wrapper = ({ children }: PropsWithChildren<{}>) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <Provider store={store}>{children}</Provider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );

  // Return an object with the store and all of RTL's query functions
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
