import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeroSubTitle = styled.img`
  width: 11rem;
  margin-top: -0.1em;
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 1024px) {
    align-items: center;
  }
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
  font-size: 4.5rem;
  font-weight: 650;
`);

const HeroCTA = motion(styled.button`
  border-radius: 50px;
  background-color: #fff;
  border: none;
  width: 30%;
  height: 3.5rem;
  cursor: pointer;
  margin-bottom: 2.5rem;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0.5rem;
  color: #9453e6;
`);

export default {
  CSELogo,
  HeroContent,
  HeroCTA,
  HeroSubTitle,
  HeroTitle
};
