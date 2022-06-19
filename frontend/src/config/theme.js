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

const lightBaseColors = {
  purplePrimary: "#9254de", // purple-5
  purpleLight: "#efdbff", // purple-2
  purpleDark: "#531dab", // purple-7
};

const darkBaseColors = {
  purplePrimary: "#9254de", // purple-5 from light theme
  purpleLight: "#301c4d", // purple-2
  purpleDark: "#854eca", // purple-7
};

export const lightTheme = {
  ...lightBaseColors,
  body: "#ffffff",
  text: "#323739",

  draggableTab: {
    backgroundColor: "#fafafa",
  },
};

export const darkTheme = {
  ...darkBaseColors,
  body: "#1d1f20",
  text: "#f1f1f1",
  tagBackground: "#9254de",

  draggableTab: {
    backgroundColor: "#fafafa",
  },
};
