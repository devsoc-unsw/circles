import { motion } from 'framer-motion';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  margin-bottom: 0px;
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
`;

const SectionContainer = styled.div`
  display: flex;
  height: 210rem;
  margin-top: 3rem;
  position: sticky;
  top: 0;
`;

const Left = styled.div`
  display: flex;
  flex: 1;
  background-color: #9254de;
  padding: 5rem;
  flex-direction: column;
`;

const Right = styled.div`
  flex: 1;
  background-color: #fbf5ff;
`;

const RightSection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
`;

const SVGContainer = motion(styled.div`
  margin-top: 5rem;
  margin-bottom: 5rem;
  width: 60%;
  height: 600px;
  transition: all 0.2s ease-in-out;
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
