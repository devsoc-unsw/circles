import { Button, Menu } from "antd";
import styled from "styled-components";

const MenuItemWrapper = styled(Menu.Item)`
  font-size: 0.8rem;
  padding-left: 40px !important;

  font-weight: ${({ selected, locked }) => {
    if (locked) return "100";
    if (selected) return "700";
    return "normal";
  }};

  color: ${({ active, theme }) => (active ? theme.purplePrimary : theme.text)} !important;

  ${({ active }) => active && `
    background-color: #EFDBFF;
  `}
`;

const MenuItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuItemCourseContainer = styled.div`
  white-space: nowrap; 
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DeselectButton = styled(Button)`
  border: none !important;
  background-color: #fafafa !important;
  box-shadow: none !important;
`;

export default {
  DeselectButton, MenuItemWrapper, MenuItemContainer, MenuItemCourseContainer,
};
