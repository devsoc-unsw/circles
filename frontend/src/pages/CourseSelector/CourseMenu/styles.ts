import { Menu as antdMenu } from 'antd';
import styled, { css } from 'styled-components';

const SidebarWrapper = styled.div`
  overflow: auto;
  overflow-x: hidden;
  height: 100%;
  border-right: 1px solid #f0f0f0;
`;

const SubgroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  color: ${({ theme }) => theme.text};
`;

const LabelTitle = styled.span`
  white-space: initial;
  line-height: 1.5;
`;

const UOCBadge = styled.div`
  border-radius: 10px;
  background-color: ${({ theme }) => theme.purpleLight};
  padding: 5px;
  font-size: 0.7rem;
  white-space: initial;
  line-height: 1.5;
  display: flex;
  align-items: center;
`;

// NOTE: Very hacky way to override menu styling
const Menu = styled(antdMenu)`
  background-color: inherit;
  color: ${({ theme }) => theme.text};

  .ant-menu-submenu-arrow {
    color: ${({ theme }) => theme.text};
  }

  ${({ theme }) =>
    theme.courseSidebar &&
    css`
      .ant-menu-sub {
        background-color: ${theme.courseSidebar.menuSubColor} !important;
      }
    `}

  // overwrite collapsible sub menu stylings
  .ant-menu-sub.ant-menu-inline > .ant-menu-item.ant-menu-item-only-child {
    padding-left: 48px !important;
  }

  ul .ant-menu-submenu > .ant-menu-submenu-title,
  .ant-menu-sub.ant-menu-inline > .ant-menu-item.ant-menu-item-only-child.ant-menu-item-disabled {
    padding-left: 32px !important;
    min-height: 40px;
    height: fit-content !important;
  }
  .ant-menu-sub.ant-menu-inline > .ant-menu-item.ant-menu-item-only-child.ant-menu-item-disabled {
    padding-right: 34px;
  }
`;

export default {
  SidebarWrapper,
  LabelTitle,
  UOCBadge,
  SubgroupHeader,
  Menu
};
