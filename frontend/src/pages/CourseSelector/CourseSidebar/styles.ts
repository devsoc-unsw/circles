import { Menu as antdMenu } from "antd";
import styled from "styled-components";

const SidebarWrapper = styled.div`
  overflow: auto;
  overflow-x: hidden;
  height: 100%;
  border-right: 1px solid #F0F0F0;
`;

const SubgroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.text};
`;

const UOCBadge = styled.div`
  border-radius: 10px;
  background-color: ${({ theme }) => theme.purpleLight};
  padding: 5px;
  font-size: 0.7rem;
`;

// NOTE: Very hacky way to override menu styling
const Menu = styled(antdMenu)`
  background-color: inherit;
  color: ${({ theme }) => theme.text};

  .ant-menu-submenu-arrow {
    color: ${({ theme }) => theme.text};
  }

  ${({ theme }) => theme.courseSidebar && `
    .ant-menu-sub {
      background-color: ${theme.courseSidebar.menuSubColor} !important;
    }
  `}
`;

export default {
  SidebarWrapper, UOCBadge, SubgroupHeader, Menu,
};
