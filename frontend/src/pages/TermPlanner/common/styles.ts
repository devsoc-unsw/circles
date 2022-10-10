import { Divider } from 'antd';
import styled, { css, keyframes } from 'styled-components';

export const GridItem = styled.div`
  font-size: var(--tp-grid-item-font-size);
  text-align: center;
`;

export const Droppable = css`
  background-color: ${({ theme }) => theme.droppable.backgroundColor};
  border-color: #e8fef2;
`;

export const shake = keyframes`
  0% {
    transform: rotate(1deg);
  }

  25% {
    transform: rotate(-1deg);
  }

  50% {
    transform: rotate(0deg);
  }

  75% {
    transform: rotate(1deg);
  }

  100% {
    transform: rotate(0deg);
  }
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
  gap: 15px;
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

const MenuHeader = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

const MenuText = styled.span`
  font-size: 1rem;
  font-weight: 500;
`;

export default {
  MenuPopup,
  PopupEntry,
  MenuWrapper,
  MenuDivider,
  MenuHeader,
  MenuText
};
