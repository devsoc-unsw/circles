import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from 'assets/back.svg';
import SplashArt from 'assets/splashart.svg';
import S from './styles';

interface AuthProps {
  onLoginHandle: () => unknown;
}

const Container = ({ onLoginHandle }: AuthProps) => {
  return (
    <S.LoginContainer>
      <S.Wrapper>
        <S.Left>
          <S.SplashArt src={SplashArt} />
        </S.Left>
        <S.Right>
          <S.Login>
            <Link to="/">
              <S.Back src={BackButton} />
            </Link>
            <h2>Login to Circles</h2>
            <p>For current UNSW Students</p>
            <S.LoginButton onClick={onLoginHandle}>Login with zID</S.LoginButton>
            <S.GuestButton>Continue as guest</S.GuestButton>
          </S.Login>
        </S.Right>
      </S.Wrapper>
    </S.LoginContainer>
  );
};

export default Container;
