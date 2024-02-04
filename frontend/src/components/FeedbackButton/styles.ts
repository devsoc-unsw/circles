import { Button as antdButton } from 'antd';
import styled from 'styled-components';

const FeedbackBtnWrapper = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 3rem;
`;

const Button = styled(antdButton)`
  background-color: ${({ theme }) => theme.bugIcon.backgroundColor};
  border-color: ${({ theme }) => theme.bugIcon.borderColor};
  &:hover {
    background-color: ${({ theme }) => theme.bugIcon.backgroundColor};
  }
`;

export default { FeedbackBtnWrapper, Button };
