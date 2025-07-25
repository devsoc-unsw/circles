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
`);

const HeroSubTitle = styled.img`
  width: 160px;
  margin-top: -6px;
  margin-left: -8px;
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
`);

const DevSocLogo = motion(styled.img`
  width: 160px;
  filter: drop-shadow(-1px -1px 0 #9154de) drop-shadow(1px -1px 0 #9154de)
    drop-shadow(-1px 1px 0 #9154de) drop-shadow(1px 1px 0 #9154de) drop-shadow(0 0 2px #9154de);
`);

export default {
  DevSocLogo,
  HeroContent,
  HeroCTA,
  HeroSubTitle,
  HeroTitle
};
