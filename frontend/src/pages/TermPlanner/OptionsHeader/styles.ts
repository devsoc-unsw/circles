import { Button } from 'antd';
import styled from 'styled-components';

const OptionsHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--option-header-height);
  padding: 0 30px;
  border-bottom-style: inset;
  border-bottom-color: ${({ theme }) => theme.optionsHeader.borderColor};
`;

const OptionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OptionButton = styled.button`
  border-color: ${({ theme }) => theme.optionsHeader.buttonBorderColor};
  border-width: 1px;
  border-style: solid;
  border-radius: 20%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.optionsHeader.buttonBackgroundColor};

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.optionsHeader.buttonHoverColor};
  }
`;

const ShowMarks = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TextShowMarks = styled.div`
  padding-bottom: 2px;
  font-size: 14px;
`;

const HeaderTextButton = styled(Button)`
  height: 36px;
`;

const AutoplanButton = styled(Button)`
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  border: none;
  color: black;
  font-weight: 700;
  letter-spacing: 0.5px;
  height: 36px;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
  transition: all 0.3s ease;

  &:hover,
  &:focus {
    background: linear-gradient(135deg, #ffed4e 0%, #ffb81a 100%);
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
    transform: scale(1.05);
    color: black;
  }

  &:active {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.9);
  }

  &:disabled {
    background: linear-gradient(135deg, #cccccc 0%, #999999 100%);
    box-shadow: none;
    color: #666666;
    opacity: 0.6;
  }
`;

export default {
  OptionsHeaderWrapper,
  OptionButton,
  OptionSection,
  ShowMarks,
  TextShowMarks,
  HeaderTextButton,
  AutoplanButton
};
