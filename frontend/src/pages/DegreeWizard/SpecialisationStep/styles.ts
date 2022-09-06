import { Menu as antdMenu } from 'antd';
import styled, { css } from 'styled-components';

// NOTE: Very hacky way to override menu styling
const Menu = styled(antdMenu)`
  border-right: none;
  background-color: inherit;

  .ant-menu-submenu {
    border: 1px solid #a86fed;
  }

  ${({ theme }) => theme.specialsationStep && css`
    .ant-menu-submenu {
      background: ${theme.specialsationStep.background};
    }
  `};

`;

export default { Menu };
