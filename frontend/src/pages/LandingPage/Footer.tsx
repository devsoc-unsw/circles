import React from 'react';
import S from './styles';

const Footer = () => {
  return (
    <S.FooterContainer>
      <img
        width="100%"
        style={{ position: 'absolute' }}
        src="./src/assets/LandingPage/Footer/backgroundShape.svg"
        alt="CSESoc Logo"
      />
      <S.FooterContentContainer>
        <S.FooterLeftContent>
          <S.CirclesLogoContainer>
            <img
              width="61"
              height="92"
              src="./src/assets/LandingPage/Footer/circlesLogo.svg"
              alt="Circles Logo"
            />
            <S.CirclesTitle>circles</S.CirclesTitle>
          </S.CirclesLogoContainer>
          <img
            width="290px"
            height="66px"
            src="./src/assets/LandingPage/Footer/CSESocLogo.svg"
            alt="CSESoc Logo"
          />
          <S.FooterTextContainer>
            <S.FooterMainLeftText>
              CSESoc is the constituent student society of UNSW’s School of Computer Science and
              Engineering. We do not represent the School, Faculty, or University.
            </S.FooterMainLeftText>
            <S.FooterMainLeftText>
              This website seeks to be a general guide, but its information has not been officially
              endorsed and is subject to change or correction. This is not official advice, and you
              should confirm any statements are correct before relying on it. Any opinions expressed
              are those of the authors, and may not necessarily represent those of the University,
              Faculty, School, or Society.
            </S.FooterMainLeftText>
            <S.FooterMainLeftText>
              You are responsible for any content provided and should only post content which you
              are comfortable with sharing. We reserve the right to remove content from the website
              if it is deemed to be abusive, offensive or otherwise inappropriate. UNSW policies
              apply and if a breach is detected, further action may be taken with the University.
            </S.FooterMainLeftText>
            <b>© 2022 — CSESoc UNSW</b>
          </S.FooterTextContainer>
        </S.FooterLeftContent>
        <S.FooterRightContent>
          <S.FooterTextContainer>
            <S.LeaveFeedbackText>Leave Feedback</S.LeaveFeedbackText>
            <p> Any comments, suggestions or feedback for improvement? We want to hear it all!</p>
          </S.FooterTextContainer>
          <S.FormInputContainer>
            <S.LeftFormInput>
              <S.LeftStyledInput placeholder="Name" />
              <S.LeftStyledInput placeholder="Email address" />
            </S.LeftFormInput>
            <S.RightFormInput>
              <S.RightStyledInput placeholder="Comment" />
            </S.RightFormInput>
          </S.FormInputContainer>
          <S.FooterSubmitButton type="submit">
            <b>SUBMIT</b>
          </S.FooterSubmitButton>
          <S.GithubText>
            <b>Checkout our github repo!</b>
            <img
              width="61"
              height="92"
              src="./src/assets/LandingPage/Footer/githubLogo.svg"
              alt="Github Logo"
            />
          </S.GithubText>
        </S.FooterRightContent>
      </S.FooterContentContainer>
    </S.FooterContainer>
  );
};

export default Footer;
