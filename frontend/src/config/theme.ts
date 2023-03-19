import { createGlobalStyle, DefaultTheme } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  html {
    font-size: 16px;
  }

  html,
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text};

    --navbar-height: 70px;
    --option-header-height: 65px;

    --cs-top-cont-height: 23%;
    --cs-tabs-cont-height: 40px;
    --cs-bottom-cont-height: calc(100% - var(--cs-top-cont-height) - var(--cs-tabs-cont-height));

    --tp-main-container-padding: 10px;
    --tp-grid-item-font-size: 1.5rem;
    --tp-planner-container-margin: 15px;
    --tp-term-box-margin: 1em;
    --tp-summer-term-box-margin: 0.5em;
  }

  .text {
    color: ${({ theme }) => theme.text} !important;
  }

  p {
    font-size: 0.9rem;
  }

  .ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
    background-color: ${({ theme }) => theme.courseMenu?.backgroundColor} !important;
  }

  .ant-notification-notice,
  .ant-notification-notice-message,
  .ant-notification-notice-close-x,
  .ant-modal-content,
  .ant-modal-header,
  .ant-modal-close-x,
  .ant-modal-title {
    background-color: ${({ theme }) => theme.body};
    color: ${({ theme }) => theme.text} !important;
  }

  // Antd Select customisation
  .ant-select-selector {
    background-color: ${({ theme }) => theme.settingsMenuSelect.selectBackgroundColor} !important;
    border-color: ${({ theme }) => theme.settingsMenuSelect.selectBorderColor} !important;
    color: ${({ theme }) => theme.text};
  }
  .ant-select-arrow {
    color: ${({ theme }) => theme.settingsMenuSelect.selectArrowColor};
  }
  .ant-select-item-option {
    background-color: ${({ theme }) => theme.settingsMenuSelect.optionBackgroundColor} !important;
    color: ${({ theme }) => theme.settingsMenuSelect.optionTextColor} !important;
  }
  .ant-select-item-option-selected {
    background-color: ${({ theme }) =>
      theme.settingsMenuSelect.optionHoverBackgroundColor} !important;
    color: ${({ theme }) => theme.settingsMenuSelect.optionTextColor} !important;
  }
  .ant-select-item-option:hover {
    background-color: ${({ theme }) =>
      theme.settingsMenuSelect.optionHoverBackgroundColor} !important;
  }

  // Scrollbar settings
  /* width */
  ::-webkit-scrollbar {
    width: 12px;               /* width of the entire scrollbar */
  }

  ::-webkit-scrollbar-track {
    background: #FAFAFA;        /* color of the tracking area */
  }

  ::-webkit-scrollbar-thumb {
    background-color: #C2C2C2;    /* color of the scroll thumb */
    border-radius: 20px;       /* roundness of the scroll thumb */
    border: 3px solid #FAFAFA;  /* creates padding around scroll thumb */
  }
`;

const lightBaseColors = {
  purplePrimary: '#9254de', // purple-5
  purpleLight: '#efdbff', // purple-2
  purpleDark: '#531dab' // purple-7
};

const darkBaseColors = {
  purplePrimary: '#9254de', // purple-5 from light theme
  purpleLight: '#51258f', // purple-2
  purpleDark: '#854eca' // purple-7
};

export const lightTheme: DefaultTheme = {
  ...lightBaseColors,
  body: '#ffffff',
  text: '#323739',
  droppable: {
    backgroundColor: '#e8fef2'
  },
  plannerCartCard: {
    backgroundColorHover: '#f4f4f4'
  },
  plannerCartMenu: {
    backgroundColor: '#ffffff'
  },
  draggableTab: {
    backgroundColor: '#fafafa',
    borderColor: '#f0f0f0'
  },

  degreeCard: {
    backgroundColor: '#f0f0f0'
  },
  draggableCourse: {
    backgroundColor: '#d9d9d9',
    warningBackgroundColor: '#ffe8c3',
    dragDisabledBackgroundColor: '#eee',
    iconColor: '#fff'
  },
  termCheckbox: {
    color: '#fff'
  },
  warningOutlined: {
    color: '#DC9930'
  },
  termBoxWrapper: {
    borderColor: '#d9d9d9'
  },
  optionsHeader: {
    borderColor: '#d9d9d9',
    buttonBorderColor: '#cecece',
    buttonBackgroundColor: '#fff',
    buttonHoverColor: '#e3e3e3'
  },
  settingsMenuSelect: {
    selectBackgroundColor: 'fff',
    selectBorderColor: '#d9d9d9',
    selectArrowColor: '#d9d9d9',
    optionBackgroundColor: '#fff',
    optionTextColor: '#000',
    optionHoverBackgroundColor: '#f5f5f5'
  },
  infoOutlined: {
    color: '#000'
  },
  uocBadge: {
    backgroundColor: '#9254de'
  },
  courseButton: {
    backgroundColor: '#fff',
    hoverBackgroundColor: '#F9F9F9'
  },

  editMark: {
    backgroundColor: '#fff',
    color: '#323739',
    borderColor: '#d9d9d9',
    borderColorHeader: '#ededed',
    backgroundColorHover: '#fff'
  }
};

export const darkTheme: DefaultTheme = {
  ...darkBaseColors,
  body: '#1d1f20',
  text: '#f1f1f1',
  droppable: {
    backgroundColor: '#373A36'
  },
  plannerCartCard: {
    backgroundColorHover: '#292a2b'
  },
  plannerCartMenu: {
    backgroundColor: '#1D1F20'
  },
  courseTag: {
    backgroundColor: '#9254de'
  },

  draggableTab: {
    backgroundColor: '#1d1f20',
    borderColor: '#1d1f20'
  },

  courseSidebar: {
    menuSubColor: '#262626' // gray-10
  },

  degreeCard: {
    backgroundColor: '#17191a'
  },
  draggableCourse: {
    backgroundColor: '#121212',
    warningBackgroundColor: '#ab6a03',
    dragDisabledBackgroundColor: '#2b2b2b',
    iconColor: '#fff'
  },
  termCheckbox: {
    color: '#000'
  },
  warningOutlined: {
    color: '#fff'
  },
  termBoxWrapper: {
    borderColor: '#4d4b4a'
  },
  optionsHeader: {
    borderColor: '#4d4b4a',
    buttonBorderColor: '#5f5a64',
    buttonBackgroundColor: '#444249',
    buttonHoverColor: '#6d6772'
  },
  settingsMenuSelect: {
    selectBackgroundColor: '#444249',
    selectBorderColor: '#5f5a64',
    selectArrowColor: '#cecece',
    optionBackgroundColor: '#444249',
    optionTextColor: '#fff',
    optionHoverBackgroundColor: '#6d6772'
  },
  infoOutlined: {
    color: '#fff'
  },
  uocBadge: {
    backgroundColor: '#51258f'
  },
  courseButton: {
    backgroundColor: '#17191A',
    hoverBackgroundColor: '#1e2021'
  },
  courseMenu: {
    backgroundColor: darkBaseColors.purpleLight
  },

  editMark: {
    backgroundColor: '#2c2b2f',
    color: '#f1f1f1',
    borderColor: '#444249',
    borderColorHeader: '#444249',
    backgroundColorHover: '#2c2b2f'
  }
};
