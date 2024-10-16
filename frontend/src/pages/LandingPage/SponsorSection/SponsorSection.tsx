import React from 'react';
import PageContainer from 'styles/PageContainer';
import janestreetLogo from 'assets/LandingPage/janestreet.png';
import tiktokLogo from 'assets/LandingPage/tiktok.svg';
import S from './styles';

type LogoProps = { src: string; href: string };

const Logo = ({ src, href }: LogoProps) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <S.LogoImg src={src} />
  </a>
);

const SponsorSection = () => (
  <PageContainer>
    <S.SponsorsText>Our sponsors</S.SponsorsText>
    <S.LogosWrapper>
      <Logo href="https://www.janestreet.com" src={janestreetLogo} />
      <Logo href="https://www.tiktok.com" src={tiktokLogo} />
    </S.LogosWrapper>
  </PageContainer>
);

export default SponsorSection;
