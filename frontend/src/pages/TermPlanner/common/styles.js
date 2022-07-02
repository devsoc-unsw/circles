import { Divider } from "antd";
import styled, { css } from "styled-components";

export const GridItem = styled.div`
  font-size: var(--tp-grid-item-font-size);
  text-align: center;
`;

export const Droppable = css`
  background-color: #e8fef2;
  border-color: #e8fef2;
`;

const MenuPopup = styled.div`
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
`;

const PopupEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const MenuWrapper = styled.div`
  padding: 1em;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5em;
`;

const MenuDivider = styled(Divider)`
  margin: 0.5rem 0;
`;

export default {
  MenuPopup, PopupEntry, MenuWrapper, MenuDivider,
};
