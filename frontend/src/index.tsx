import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App';
import store from './config/store';

const persistor = persistStore(store);

const root = createRoot(document.getElementById('root') as HTMLElement);

root.render(
  // TODO: disabled strict mode because of react-beautiful-dnd
  // https://github.com/atlassian/react-beautiful-dnd/issues/2396
  // <React.StrictMode>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
  // </React.StrictMode>,
);
