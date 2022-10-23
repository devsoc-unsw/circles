import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 1.5rem;
`;

const Header = motion(styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  top: 0;
  padding: 2.5rem;
  margin: 0 3rem 0 3rem;
`);

const HeaderLogo = styled.img`
  width: 2.5rem;
  margin-right: 1rem;
`;

const HeaderTitle = styled.h1`
  color: #fff;
  margin-right: auto;
`;

const LoginButton = styled.button`
  background: none;
  border-radius: 50px;
  border: solid 0.3rem #79f165;
  width: 10vw;
  height: 3rem;
  font-weight: 500;
  color: #fff;
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CSELogo = motion(styled.img`
  width: 12em;
`);

const HeroTitle = motion(styled.h1`
  min-width: 80%;
  width: 42rem;
  color: #fff;
  line-height: 1.2em;
  letter-spacing: 0.01em;
  font-size: 5rem;
  font-weight: 650;
`);

const HeroCTA = motion(styled.button`
  border-radius: 50px;
  background-color: #fff;
  border: none;
  width: 11.5vw;
  height: 3.5rem;
  margin-bottom: 2.5rem;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.5rem;
  color: #9453e6;
`);

const LandingLogo = motion(styled.img`
  width: 200px;
`);

const waveAnimation = keyframes`
  0%, {margin-left: 0;}
  100% {margin-left: -1600px;}
`;

const waveSwell = keyframes`
  0%, 100% {
    transform: translate3d(0,-30px,0);
  }
  50% {
    transform: translate3d(0,5px,0);
  }
`;

const Background = styled.div`
  animation-fill-mode: backwards;
  background: url('src/assets/landingHero/wave4.svg') repeat-x;
  position: absolute;
  animation: ${waveAnimation} 5s cubic-bezier(0.36, 0.45, 0.63, 0.53) infinite;
  width: 6400px;
  height: 916px;
  top: -33px;
  transform: translate3d(0, 0, 0);
  z-index: -98;
`;

const Background2 = styled.div`
  animation-fill-mode: backwards;
  background: url('src/assets/landingHero/wave3.svg') repeat-x;
  position: absolute;
  animation: ${waveAnimation} 5s cubic-bezier(0.36, 0.45, 0.63, 0.53) -0.125s infinite,
    ${waveSwell} 5s ease -1.25s infinite;
  z-index: -99;
  top: -10px;
  width: 6400px;
  height: 916px;
`;

const BackgroundWrapper = styled.div`
  width: 100vw;
  height: 1000px;
  position: absolute;
  z-index: -99;
  overflow-x: hidden;
  max-width: 100%;
`;

export default {
  LandingLogo,
  Background,
  Background2,
  Wrapper,
  HeroContent,
  HeroTitle,
  HeroCTA,
  Header,
  HeaderLogo,
  LoginButton,
  HeaderTitle,
  BackgroundWrapper,
  CSELogo
};
