import styled from "styled-components";

const OptionsHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--option-header-height);
  padding: 0 30px;
  border-bottom-style: inset;
`;

const OptionSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const OptionButton = styled.button`
  border: 1px solid #cecece;
  border-radius: 20%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;

  &:hover {
    cursor: pointer;
    background-color: #e3e3e3;
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

export default { OptionsHeaderWrapper, OptionButton, OptionSection, ShowMarks, TextShowMarks };
