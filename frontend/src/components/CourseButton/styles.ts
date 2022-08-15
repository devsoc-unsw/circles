import Button from 'antd/lib/button';
import styled, { css } from 'styled-components';

const CourseButton = styled(Button)<{ planned?: boolean }>`
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 271px;
  height: 80px;
  white-space: normal;

  ${({ planned }) => !planned && css`
    background: #FFF; 
    color: #9254de !important;

    &:hover {
      background-color: #F9F9F9;
    }
  `}
`;

export default { CourseButton };
