import React from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import store from "config/store";
import "config/axios";
import "./App.css";

const persistor = persistStore(store);

const MyApp = ({ Component, pageProps }) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <Component {...pageProps} />
    </PersistGate>
  </Provider>
);

export default MyApp;
