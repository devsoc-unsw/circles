import { motion } from 'framer-motion';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 25rem;
  margin-top: -15rem;
`;

const LandingLogo = motion(styled.img`
  width: 200px;
  margin-left: -8em;
  position: relative;
  z-index: 1;
`);

const Bubble = motion(styled.div`
  background-color: #fff;
  border-radius: 50%;
  width: 2em;
  height: 2em;
  margin-left: -25em;
`);

const Bubble2 = motion(styled.div`
  background-color: #fff;
  border-radius: 50%;
  width: 3em;
  height: 3em;
  margin-left: -10em;
`);

export default {
  Wrapper,
  LandingLogo,
  Bubble,
  Bubble2
};
