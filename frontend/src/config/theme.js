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

  .text {
    color: ${({ theme }) => theme.text} !important;
  }
`;

const lightBaseColors = {
  purplePrimary: "#9254de", // purple-5
  purpleLight: "#efdbff", // purple-2
  purpleDark: "#531dab", // purple-7
};

const darkBaseColors = {
  purplePrimary: "#9254de", // purple-5 from light theme
  purpleLight: "#51258f", // purple-2
  purpleDark: "#854eca", // purple-7
};

export const lightTheme = {
  ...lightBaseColors,
  body: "#ffffff",
  text: "#323739",
  droppable: {
    backgroundColor: "#e8fef2",
  },
  plannerCartCard: {
    backgroundColorHover: "#f4f4f4",
  },
  plannerCartMenu: {
    backgroundColor: "#ffffff",
  },
  draggableTab: {
    backgroundColor: "#fafafa",
    borderColor: "#f0f0f0",
  },

  degreeCard: {
    backgroundColor: "#f0f0f0",
  },
  draggableCourse: {
    backgroundColor: "#d9d9d9",
    warningBackgroundColor: "#ffe8c3",
    dragDisabledBackgroundColor: "#eee",
    iconColor: "#fff",
  },
  termCheckbox: {
    color: "#fff",
  },
  warningOutlined: {
    color: "#DC9930",
  },
  termBoxWrapper: {
    borderColor: "#d9d9d9",
  },
  optionsHeader: {
    borderColor: "#d9d9d9",
  },
  infoOutlined: {
    color: "#000",
  },
  uocBadge: {
    backgroundColor: "#9254de",
  },
};

export const darkTheme = {
  ...darkBaseColors,
  body: "#1d1f20",
  text: "#f1f1f1",
  droppable: {
    backgroundColor: "#373A36",
  },
  plannerCartCard: {
    backgroundColorHover: "#292a2b",
  },
  plannerCartMenu: {
    backgroundColor: "#434343",
  },
  courseTag: {
    backgroundColor: "#9254de",
  },

  draggableTab: {
    backgroundColor: "#1d1f20",
    borderColor: "#1d1f20",
  },

  courseSidebar: {
    menuSubColor: "#262626", // gray-10
  },

  specialsationStep: {
    background: "#fff",
  },

  degreeCard: {
    backgroundColor: "#17191a",
  },
  draggableCourse: {
    backgroundColor: "#121212",
    warningBackgroundColor: "#ab6a03",
    dragDisabledBackgroundColor: "#2b2b2b",
    iconColor: "#fff",
  },
  termCheckbox: {
    color: "#000",
  },
  warningOutlined: {
    color: "#fff",
  },
  termBoxWrapper: {
    borderColor: "#4d4b4a",
  },
  optionsHeader: {
    borderColor: "#4d4b4a",
  },
  infoOutlined: {
    color: "#fff",
  },
  uocBadge: {
    backgroundColor: "#51258f",
  },
};
