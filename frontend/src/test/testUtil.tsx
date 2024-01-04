import React, { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import axios from 'config/axios';
import { AppStore, RootState, setupStore } from 'config/store';
import { lightTheme } from 'config/theme';
import '@testing-library/jest-dom/extend-expect';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: PreloadedState<RootState>;
  store?: AppStore;
}

// eslint-disable-next-line import/prefer-default-export
export const renderWithProviders = async (
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = setupStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  const queryClient = new QueryClient();
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
  if (Object.keys(preloadedState).length !== 0) {
    await axios.post('user/saveLocalStorage', preloadedState);
  }
  // Return an object with the store and all of RTL's query functions
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
