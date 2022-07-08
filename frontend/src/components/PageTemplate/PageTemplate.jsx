import React from "react";
import { useSelector } from "react-redux";
import { ThemeProvider } from "styled-components";
import FeedbackButton from "components/FeedbackButton";
import Header from "components/Header";
import { darkTheme, GlobalStyles, lightTheme } from "config/theme";

const PageTemplate = ({ children, showHeader = true }) => {
  const { theme } = useSelector((state) => state.settings);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <GlobalStyles />
      {showHeader && <Header />}
      <div>
        {children}
        <FeedbackButton />
      </div>
    </ThemeProvider>
  );
};

export default PageTemplate;
