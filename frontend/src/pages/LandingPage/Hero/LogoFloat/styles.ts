import { motion } from 'framer-motion';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
`;

const LandingLogo = motion(styled.img`
  width: 200px;
  position: relative;
  z-index: 1;
`);

const Bubble = motion(styled.div`
  background-color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  position: absolute;
  top: -140px;
  left: -210px;
`);

const Bubble2 = motion(styled.div`
  background-color: #fff;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  position: absolute;
  top: -140px;
  left: -10px;
`);

export default {
  Wrapper,
  LandingLogo,
  Bubble,
  Bubble2
};
