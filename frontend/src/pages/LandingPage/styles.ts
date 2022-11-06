import { motion } from 'framer-motion';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 1.5rem;
  gap: 10rem;

  @media (max-width: 1024px) {
    flex-direction: column-reverse;
    text-align: center;
    gap: 3rem;
  }
`;

const HeaderDots = motion(styled.img`
  width: 2.8rem;
  position: absolute;
  left: 0;
`);

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
  LandingLogo,
  Wrapper,
  HeaderDots,
  Bubble,
  Bubble2
};
