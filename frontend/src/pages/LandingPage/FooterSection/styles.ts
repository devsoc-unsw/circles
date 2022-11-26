import styled from 'styled-components';

const FooterContainer = styled.div`
  margin-bottom: 0;
  width: 100%;
  background: -webkit-linear-gradient(rgba(145, 84, 222, 0) 160px, rgba(145, 84, 222, 1) 10px);
  @media all and (max-width: 450px) {
    background: -webkit-linear-gradient(rgba(145, 84, 222, 0) 5%, rgba(145, 84, 222, 1) 10px);
  }
`;

const FooterContentContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  padding: 150px 50px 0px 50px;
  gap: 80px;
  flex-wrap: wrap;
`;

const FooterLeftContent = styled.div`
  width: 40%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  @media all and (max-width: 900px) {
    width: 100%;
  }
`;

const CirclesLogoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 30px;
`;

const CirclesTitle = styled.b`
  color: white;
  font-size: 50px;
`;

const FooterTextContainer = styled.p`
  color: white;
`;

const FooterMainLeftText = styled.p`
  font-size: 12px;
`;

const FooterRightContent = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  padding-top: 30px;
  @media all and (max-width: 900px) {
    width: 100%;
  }
`;

const LeaveFeedbackText = styled.b`
  font-size: 30px;
`;

const FormInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  justify-content: space-between;
  gap: 10px;
  height: 126px;
`;

const StyledInput = styled.input`
  font-size: 15px;
  background-color: #d3b4eb;
  color: #b768c3;
  border-radius: 30px;
  border-style: none;
`;

const LeftFormInput = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LeftStyledInput = styled.input`
  font-size: 15px;
  background-color: #d3b4eb;
  font-color: #b768c3;
  border-color: #fff4f4;
  border-radius: 10px;
  border-style: none;
  padding: 0px 5%;
  height: 50%;
  ::placeholder {
    color: #b768c3;
  }
`;

const RightFormInput = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
`;

const RightStyledInput = styled.input`
  font-size: 15px;
  background-color: #d3b4eb;
  border-radius: 10px;
  border-style: none;
  padding: 0px 5%;
  height: 100%;
  ::placeholder {
    color: #b768c3;
  }
`;

const FooterSubmitButton = styled.button`
  margin-top: 30px;
  width: 187px;
  height: 50px;
  border-radius: 30px;
  color: #9453e6;
  border: none;
  cursor: pointer;
`;

const GithubText = styled.p`
  color: white;
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: end;
`;

export default {
  FooterContainer,
  FooterContentContainer,
  FooterLeftContent,
  CirclesLogoContainer,
  CirclesTitle,
  FooterMainLeftText,
  FooterRightContent,
  LeaveFeedbackText,
  FooterTextContainer,
  LeftFormInput,
  LeftStyledInput,
  RightFormInput,
  RightStyledInput,
  FormInputContainer,
  StyledInput,
  FooterSubmitButton,
  GithubText
};
