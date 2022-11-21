import { motion } from 'framer-motion';
import styled from 'styled-components';

const Header = motion(styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  top: 0;
  padding: 2.5rem;
  margin: 0 3rem 0 3rem;
`);

const HeaderTitle = styled.h1`
  color: #fff;
  margin-right: auto;
`;

const HeaderLogo = styled.img`
  width: 2.5rem;
  margin-right: 1rem;
`;

const LoginButton = styled.button`
  background: none;
  border-radius: 50px;
  border: solid 0.3rem #e3a4fa;
  width: 12%;
  height: 3rem;
  cursor: pointer;
  background: transparent;
  font-weight: 700;
  color: #fff;
  transition: all 0.1s;
  z-index: 1;

  &: hover {
    background: #e3a4fa;
    font-size: 1.2em;
    color: #fff;
  }

  &: active {
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
