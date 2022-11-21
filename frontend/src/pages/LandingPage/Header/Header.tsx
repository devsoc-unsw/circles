import React from 'react';
import { Link } from 'react-router-dom';
import circlesLogo from 'assets/circlesLogo.svg';
import S from './styles';

const Header = () => (
  <S.Header animate={{ y: 0 }} initial={{ y: -40 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
    <Link to="/landing-page">
      <S.LogoWrapper>
        <S.HeaderLogo src={circlesLogo} alt="Circles Logo" />
        <S.HeaderTitle>circles</S.HeaderTitle>
      </S.LogoWrapper>
    </Link>
    <S.LoginButton>Log in</S.LoginButton>
  </S.Header>
);

export default Header;
