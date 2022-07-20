import styled from "styled-components";
import { Typography } from "antd";

const MarksWrapper = styled.div`
  display: flex;
  flex-direction: row;
  border: solid #000000 2px;

  &:hover {
    border: 1px solid #000000;
  }
`;

const Text = styled(Typography)`
  color: ${({ theme }) => theme.text};
`;

export default { MarksWrapper, Text };
