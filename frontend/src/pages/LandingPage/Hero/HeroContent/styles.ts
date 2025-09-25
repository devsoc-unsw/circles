import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  @media (max-width: 1024px) {
    align-items: center;
  }
`;

const HeroTitle = motion(styled.h1`
  color: #fff;
  line-height: 1.2;
  font-size: 70px;
  font-weight: 650;
  text-shadow:
    -2px -2px 0 #9154de,
    2px -2px 0 #9154de,
    -2px 2px 0 #9154de,
    2px 2px 0 #9154de,
    -2px 0 0 #9154de,
    2px 0 0 #9154de,
    0 -2px 0 #9154de,
    0 2px 0 #9154de;

  @media (max-width: 768px) {
    font-size: 42px;
    line-height: 1.1;
    margin-bottom: 1rem;
  }

  @media (max-width: 480px) {
    font-size: 32px;
    line-height: 1.1;
  }
`);

const HeroSubTitle = styled.img`
  width: 160px;
  margin-top: -6px;
  margin-left: -8px;

  @media (max-width: 768px) {
    width: 11.25rem;
    margin-top: -4px;
    margin-left: -6px;
  }

  @media (max-width: 480px) {
    width: 100px;
    margin-top: -3px;
    margin-left: -4px;
  }
`;

const HeroCTA = motion(styled.button`
  border-radius: 50px;
  background-color: #fff;
  border: none;
  width: 250px;
  height: 3.5rem;
  cursor: pointer;
  margin-bottom: 2.5rem;
  font-weight: 700;
  font-size: 1rem;
  color: #9453e6;
  filter: drop-shadow(-1px -1px 0 #9154de) drop-shadow(1px -1px 0 #9154de)
    drop-shadow(-1px 1px 0 #9154de) drop-shadow(1px 1px 0 #9154de) drop-shadow(0 0 2px #9154de);

  @media (max-width: 768px) {
    width: 21.25rem;
    height: 3rem;
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    width: 200px;
    height: 2.8rem;
    font-size: 0.85rem;
    margin-bottom: 1.5rem;
  }
`);

const DevSocLogo = motion(styled.img`
  width: 160px;
  filter: drop-shadow(-1px -1px 0 #9154de) drop-shadow(1px -1px 0 #9154de)
    drop-shadow(-1px 1px 0 #9154de) drop-shadow(1px 1px 0 #9154de) drop-shadow(0 0 2px #9154de);

  @media (max-width: 1024px) {
    margin-top: 1rem;
  }

  @media (max-width: 768px) {
    width: 140px;
  }

  @media (max-width: 480px) {
    width: 11.25rem;
  }
`);

export default {
  DevSocLogo,
  HeroContent,
  HeroCTA,
  HeroSubTitle,
  HeroTitle
};
