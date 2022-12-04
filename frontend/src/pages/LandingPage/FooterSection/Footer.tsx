import React from 'react';
import csesocLogoSrc from 'assets/csesocLogo.png';
import footerBlobSrc from 'assets/LandingPage/footerBlob.svg';
import S from './styles';

const Footer = () => {
  return (
    <S.FooterContainer>
      <S.StyledImg src={footerBlobSrc} alt="CSESoc Logo" />
      <S.FooterContentContainer>
        <S.FooterContent>
          <S.StyledCSELogo src={csesocLogoSrc} alt="CSESoc Logo" />
          <S.BottomLeft>© 2022 — CSESoc UNSW</S.BottomLeft>
        </S.FooterContent>
        <S.FooterContent>
          <S.FooterText>
            CSESoc is the constituent student society of UNSW’s School of Computer Science and
            Engineering. We do not represent the School, Faculty, or University.
            <br />
            <br />
            This website seeks to be a general guide for degree planning and course selection, but
            its information has not been officially endorsed and is subject to change or correction.
            This is not official advice, and you should confirm any statements are correct before
            relying on it. You should confirm with official resources endorsed by UNSW and any
            information found here may not necessarily represent those of the University, Faculty,
            School, or the Computer Science and Engineering Society.
            <br />
            <br />
            You are responsible for planning your degree and the Computer Science and Engineering
            Society have no responsibility on whether the information shown is accurate.
            <br />
            <br />
            Circles was made with love by CSE students for CSE students.
          </S.FooterText>
        </S.FooterContent>
      </S.FooterContentContainer>
    </S.FooterContainer>
  );
};

export default Footer;
