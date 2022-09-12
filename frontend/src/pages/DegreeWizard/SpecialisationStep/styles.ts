import { Menu as antdMenu } from 'antd';
import styled, { css } from 'styled-components';

// NOTE: Very hacky way to override menu styling
const Menu = styled(antdMenu)`
  border-right: none;
  background-color: inherit;
  color: ${({ theme }) => theme.text};

  .ant-menu-submenu-title {
    background-color: inherit;
  }

  ${({ theme }) => theme.courseSidebar && css`
    .ant-menu-sub {
      background-color: ${theme.courseSidebar.menuSubColor} !important;
    }
  `}

  .ant-menu-title-content, .ant-menu-submenu-arrow {
    color: ${({ theme }) => theme.text};
  }

  .ant-menu-submenu {
    border: 1px solid #a86fed;
  }

`;

export default { Menu };
