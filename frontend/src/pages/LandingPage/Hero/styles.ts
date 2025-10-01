import { motion } from 'framer-motion';
import styled from 'styled-components';

const HeroSection = styled.section`
  margin-bottom: 22rem;

  @media (max-width: 800px) {
    margin-bottom: 8rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 4rem;
  }
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

  @media (max-width: 800px) {
    padding: 16px 0;
    gap: 24px;
  }

  @media (max-width: 480px) {
    padding: 12px 0;
    gap: 16px;
  }
`;

const HeaderDots = motion(styled.img`
  width: 40px;
  position: absolute;
  left: 0;

  @media (max-width: 1024px) {
    display: none;
  }
`);

export default {
  HeroSection,
  ContentWrapper,
  HeaderDots
};
