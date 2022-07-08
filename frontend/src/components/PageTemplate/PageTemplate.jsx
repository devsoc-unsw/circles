import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ThemeProvider } from "styled-components";
import FeedbackButton from "components/FeedbackButton";
import Header from "components/Header";
import PageLoading from "components/PageLoading";
import { darkTheme, GlobalStyles, lightTheme } from "config/theme";

const PageTemplate = ({ children, showHeader = true }) => {
  const [loading, setLoading] = useState(true);
  const theme = useSelector((state) => state.theme);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      {loading ? (
        <PageLoading setLoading={setLoading} />
      ) : (
        <>
          {showHeader && <Header />}
          <div>
            {children}
            <FeedbackButton />
          </div>
        </>
      )}
    </ThemeProvider>
  );
};

export default PageTemplate;
