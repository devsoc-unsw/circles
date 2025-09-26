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
  flex-wrap: wrap;

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    left: auto;
    transform: none;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    padding: 12px 16px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    gap: 12px;
    font-size: 14px;
    flex-direction: column;
    align-items: center;
  }

  @media (max-width: 480px) {
    gap: 8px;
    padding: 10px 12px;
    bottom: 20px;
    right: 20px;
  }
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

  @media (max-width: 768px) {
    height: 40px;
    width: 40px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    min-width: 40px;

    .anticon {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    height: 36px;
    width: 36px;
    border-radius: 18px;
    min-width: 36px;

    .anticon {
      font-size: 14px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export default { SpinnerWrapper, ToolsWrapper, Wrapper, Button, ButtonGroup };
