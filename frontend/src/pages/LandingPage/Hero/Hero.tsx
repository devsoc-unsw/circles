import React from 'react';
import svgDots from 'assets/LandingPage/dots.svg';
import Header from './Header';
import HeroContent from './HeroContent';
import LogoFloat from './LogoFloat';
import S from './styles';
import Wave from './Wave';

const Hero = () => (
  <S.HeroSection>
    <Wave />
    <S.Container>
      <S.Section>
        <Header />
        <S.Wrapper>
          <S.HeaderDots
            src={svgDots}
            alt="Svg Dots"
            animate={{ x: 0, opacity: 1 }}
            initial={{ x: -30, opacity: 0 }}
          />
          <HeroContent />
          <LogoFloat />
        </S.Wrapper>
      </S.Section>
    </S.Container>
  </S.HeroSection>
);

export default Hero;
