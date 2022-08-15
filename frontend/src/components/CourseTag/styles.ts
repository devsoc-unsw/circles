import antdTag from 'antd/lib/tag';
import styled from 'styled-components';

const Tag = styled(antdTag)`
  margin-bottom: 8px;

  ${({ theme }) => theme.courseTag && `
    background: ${theme.courseTag.backgroundColor};
  `}

  :hover {
    cursor: pointer;
  }
`;

export default { Tag };
