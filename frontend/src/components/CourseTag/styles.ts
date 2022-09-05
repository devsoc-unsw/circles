import { Tag as antdTag } from 'antd';
import styled, { css } from 'styled-components';

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && css`
    background: ${theme.courseTag.backgroundColor};
  `}

  :hover {
    cursor: pointer;
  }
`;

export default { Tag };
