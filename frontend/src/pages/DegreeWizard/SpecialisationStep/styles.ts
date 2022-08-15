import antdMenu from 'antd/lib/menu';
import styled from 'styled-components';

// NOTE: Very hacky way to override menu styling
const Menu = styled(antdMenu)`
  border-right: none;
  background-color: inherit;

  ${({ theme }) => theme.specialsationStep && `
    .ant-menu-submenu {
      background: ${theme.specialsationStep.background}
    }
  `};

`;

export default { Menu };
