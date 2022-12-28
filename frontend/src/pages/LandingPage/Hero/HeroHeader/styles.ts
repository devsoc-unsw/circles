import { motion } from 'framer-motion';
import styled from 'styled-components';

const Header = motion(styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 0;
`);

const LoginButton = styled.button`
  background: none;
  border-radius: 50px;
  border: solid 3px #e3a4fa;
  text-transform: uppercase;
  width: 100px;
  cursor: pointer;
  background: transparent;
  font-weight: 700;
  color: #fff;
  padding: 6px 0;
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
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const HeaderLogo = styled.img`
  width: 40px;
`;

const HeaderTitle = styled.h1`
  color: #fff;
  font-size: 26px;
`;

export default {
  Header,
  HeaderLogo,
  HeaderTitle,
  LogoWrapper,
  LoginButton
};
