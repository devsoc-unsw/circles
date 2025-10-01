import { motion } from 'framer-motion';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  margin-bottom: 80px;

  @media (max-width: 800px) {
    margin-bottom: 40px;
  }
`;

const Title = styled.h1`
  font-size: 50px;
  margin-bottom: 3rem;
  background: -webkit-linear-gradient(30deg, #9f62de, #b77eff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  position: relative;
  font-weight: 700;

  @media (max-width: 800px) {
    font-size: 36px;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 28px;
    margin-bottom: 1.5rem;
  }
`;

const SectionContainer = styled.div`
  display: flex;
  height: 210rem;
  margin-top: 3rem;
  position: sticky;
  top: 0;

  @media (max-width: 800px) {
    flex-direction: column;
    height: auto;
    position: static;
    margin-top: 2rem;
  }
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  background-color: #9254de;
  padding: 5rem;
  flex-direction: column;

  @media (max-width: 800px) {
    padding: 2rem;
    min-height: 60vh;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
    min-height: 50vh;
  }
`;

const Right = styled.div`
  flex: 1;
  background-color: #fbf5ff;

  @media (max-width: 800px) {
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const RightSection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;

  @media (max-width: 800px) {
    position: static;
    padding: 2rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const SVGContainer = motion(styled.div`
  margin-top: 5rem;
  margin-bottom: 5rem;
  width: 60%;
  height: 600px;
  transition: all 0.2s ease-in-out;

  @media (max-width: 800px) {
    width: 80%;
    height: 400px;
    margin-top: 2rem;
    margin-bottom: 2rem;
  }

  @media (max-width: 480px) {
    width: 90%;
    height: 300px;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
`);

export default {
  StyledWrapper,
  Title,
  SectionContainer,
  SVGContainer,
  Left,
  Right,
  RightSection
};
