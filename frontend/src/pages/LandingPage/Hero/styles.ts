import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeroSection = styled.section`
  margin-bottom: 22rem;
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26px 0;
  gap: 36px;

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
    text-align: center;
  }
`;

const HeaderDots = motion(styled.img`
  width: 40px;
  position: absolute;
  left: 0;
`);

export default {
  HeroSection,
  ContentWrapper,
  HeaderDots
};
