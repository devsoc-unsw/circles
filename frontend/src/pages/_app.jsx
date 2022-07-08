import React from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "config/store";
import "config/axios";
import "./App.css";

const persistor = persistStore(store);

// TODO: Is there a need for SSR? Remove this once we dont need redux-persist
// and saving storage in BE
const PersistGateSSR = ({ children }) => {
  if (typeof window === "undefined") {
    // Not on browser, nothing to persist here
    return children;
  }
  return (
    <PersistGate loading={null} persistor={persistor}>
      {children}
    </PersistGate>
  );
};

const MyApp = ({ Component, pageProps }) => (
  <Provider store={store}>
    <PersistGateSSR loading={null} persistor={persistor}>
      <Component {...pageProps} />
    </PersistGateSSR>
  </Provider>
);

export default MyApp;
