import { Button } from "antd";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DeselectButton = styled(Button)`
  border: none !important;
  background-color: #fafafa !important;
  box-shadow: none !important;
`;

const IconsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;
`;

const CourseTitleWrapper = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  font-size: 0.8rem;

  font-weight: ${({ selected, locked }) => {
    if (locked) return "100";
    if (selected) return "700";
    return "normal";
  }};

  color: ${({ active, theme }) => (active ? theme.purplePrimary : theme.text)} !important;

`;

export default {
  Wrapper, DeselectButton, IconsWrapper, CourseTitleWrapper,
};
