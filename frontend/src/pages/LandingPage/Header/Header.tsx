import React from 'react';
import circlesLogo from 'assets/circlesLogo.svg';
import S from './styles';

const Header = () => (
  <S.Header animate={{ y: 0 }} initial={{ y: -40 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
    <S.HeaderLogo src={circlesLogo} alt="Circles Logo" />
    <S.HeaderTitle>circles</S.HeaderTitle>
    <S.LoginButton>Log in</S.LoginButton>
  </S.Header>
);

export default Header;
