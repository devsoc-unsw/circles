import { Tag as antdTag } from "antd";
import styled from "styled-components";

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && `
    background: ${theme.courseTag.backgroundColor};
  `}

  /* :hover {
    cursor: pointer;
  } */
`;

export default { Tag };
