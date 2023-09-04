import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from 'assets/back.svg';
import SplashArt from 'assets/splashart.svg';
import S from './styles';

const Container = () => {
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
            <h2>Login to circles</h2>
            <p>For current UNSW Students</p>
            <button type="button">Login with zID</button>
          </S.Login>
        </S.Right>
      </S.Wrapper>
    </S.LoginContainer>
  );
};

export default Container;
