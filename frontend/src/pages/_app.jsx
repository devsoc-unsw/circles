import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "styled-components";
import PageLoading from "components/PageLoading";
import store from "config/store";
import { darkTheme, GlobalStyles, lightTheme } from "config/theme";
import "config/axios";
import "./App.css";

const persistor = persistStore(store);

const MyApp = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(true);
  // const theme = useSelector((state) => state.theme);
  const theme = "light";

  useEffect(() => {
    // initialise theme
    document.body.classList.add(theme);
    document.body.classList.remove(theme === "light" ? "dark" : "light");
  }, [theme]);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
          <GlobalStyles />
          {loading ? (
            <PageLoading setLoading={setLoading} />
          ) : (
            <Component {...pageProps} />
          )}
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default MyApp;
