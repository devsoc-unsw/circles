import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  html,
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};
  }
`;

export const lightTheme = {
  body: "#ffffff",
  text: "#323739",
};

export const darkTheme = {
  body: "#1d1f20",
  text: "#f1f1f1",
};
