import styled from 'styled-components';

const LandingPageContainer = styled.div`
  margin-top: 30px;
`;

const LandingPageTitle = styled.h1`
  font-size: 50px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: space-evenly;
  position: relative;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  display: inline-block;
  height: 275px;
  margin: 1rem;
  position: relative;
  width: 250px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  padding: 45px 25px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }
`;

const IconContainer = styled.div`
  height: 66px;
  width: 66px;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 15px;
  background: ${({ color }) => color};
`;

const LandingPageSubtitle = styled.h3<{ startColor: string; endColor: string }>`
  font-size: 20px;
  background: -webkit-linear-gradient(
    45deg,
    ${({ startColor }) => startColor},
    ${({ endColor }) => endColor}
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Divider = styled.hr`
  width: 80%;
  height: 6px;
  border-radius: 2px;
  border: 0 none;
  margin: 10px 0px;
  background-color: ${({ color }) => color};
`;

const Content = styled.p`
  font-size: 13px;
  color: #c8bfbf;
  letter-spacing: -0.3px;
  line-height: 15px;
`;

const InteractiveViewContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15%;
  flex-wrap: wrap;
  margin: 15% 5%;
`;

const InteractiveViewTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 370px;
  viewBox="0 0 723 505";
`;

const InteractiveViewTitle = styled.h1`
  font-size: 40px;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  font-weight: 600;
`;

const InteractiveViewText = styled.p`
  font-size: 15px;
  color: #acacac;
`;

const GradientBox = styled.div`
  width: 500px;
  height: 500px;
  border-radius: 20px;
  background: -webkit-linear-gradient(#eeddff, #faeef5, #ffffff);
`;

const FooterContainer = styled.div`
  margin-bottom: 0;
  width: 100%;
  background: -webkit-linear-gradient(rgba(145, 84, 222, 0) 160px, rgba(145, 84, 222, 1) 160px);
`;

const FooterContentContainer = styled.div`
  position: 'absolute';
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
  LandingPageContainer,
  LandingPageTitle,
  CardContainer,
  Card,
  IconContainer,
  LandingPageSubtitle,
  Divider,
  Content,
  InteractiveViewContainer,
  InteractiveViewTextContainer,
  InteractiveViewTitle,
  InteractiveViewText,
  GradientBox,
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
