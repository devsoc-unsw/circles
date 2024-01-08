import { Button as antdButton } from 'antd';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToolsWrapper = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SpinnerWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Button = styled(antdButton)`
  background-color: ${({ theme }) => theme.genericButton.backgroundColor};
  color: ${({ theme }) => theme.text};
  border-color: ${({ theme }) => theme.genericButton.borderColor};
  &:hover {
    background-color: ${({ theme }) => theme.genericButton.hoverBackgroundColor};
  }
  &:focus {
    background-color: ${({ theme }) => theme.genericButton.hoverBackgroundColor};
  }
`;

export default { SpinnerWrapper, ToolsWrapper, Wrapper, Button };
