import { motion } from 'framer-motion';
import styled from 'styled-components';

const Header = motion(styled.header`
  display: flex;
  align-items: end;
  justify-content: space-between;
  top: 0;
  padding: 2.5rem;
  margin: 0 -10rem;

  @media (max-width: 1200px) {
    margin: 0 -3rem;
  }
`);

const HeaderTitle = styled.h1`
  color: #fff;
  margin-right: auto;
  font-size: 1.8rem;
`;

const HeaderLogo = styled.img`
  width: 2.8rem;
  margin-right: 1rem;
`;

const LoginButton = styled.button`
  background: none;
  border-radius: 50px;
  border: solid 3px #e3a4fa;
  text-transform: uppercase;
  width: 10%;
  height: 45px;
  cursor: pointer;
  background: transparent;
  font-weight: 700;
  color: #fff;
  transition: all 0.1s;
  z-index: 1;
  &:hover {
    background: #e3a4fa;
    font-size: 1.2em;
    color: #fff;
  }
  &:active {
    scale: 0.9;
  }
  @media (max-width: 1024px) {
    width: 20%;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export default {
  Header,
  HeaderLogo,
  HeaderTitle,
  LogoWrapper,
  LoginButton
};
