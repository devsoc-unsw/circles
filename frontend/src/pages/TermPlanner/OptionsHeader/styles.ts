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

export default {
  OptionsHeaderWrapper,
  OptionButton,
  OptionSection,
  ShowMarks,
  TextShowMarks
};
