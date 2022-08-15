import antdTag from 'antd/lib/tag';
import styled, { css } from 'styled-components';

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && css`
    background: ${theme.courseTag.backgroundColor};
  `}
`;

export default { Tag };
