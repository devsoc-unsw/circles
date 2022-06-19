import styled from "styled-components";

const DraggableTabWrapper = styled.div`
  height: 100%;
  border-radius: 10px 0 0 0;
  background-color: ${({ theme }) => theme.draggableTab.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: 6px 6px 6px 16px;
  margin-left: 2px;
  border: 1px solid #f0f0f0;

  ${({ active }) => active && `
    background-color: #fff;
    border-bottom-color: #fff;
    color: #9254de;
  `}
`;

const TabNameWrapper = styled.span`
  &:hover {
    color: #9254de;
    cursor: pointer;
  }
`;

export default { DraggableTabWrapper, TabNameWrapper };
