import { Tag as antdTag } from "antd";
import styled from "styled-components";

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.tagBackground && `
    background: ${theme.tagBackground};
  `}

  :hover {
    cursor: pointer;
  }
`;

export default { Tag };
