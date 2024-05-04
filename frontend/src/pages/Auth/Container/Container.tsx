import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { guestLogin } from 'utils/api/auth';
import { userLogin } from 'utils/api/userApi';
import BackButton from 'assets/back.svg';
import SplashArt from 'assets/splashart.svg';
import { setToken } from 'reducers/settingsSlice';
import S from './styles';

const Container = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
            <S.LoginButton onClick={userLogin}>Login with zID</S.LoginButton>
            <S.GuestButton
              onClick={async () => {
                const res = await guestLogin();
                dispatch(setToken(res.session_token));
                navigate('/degree-wizard');
              }}
            >
              Continue as guest
            </S.GuestButton>
          </S.Login>
        </S.Right>
      </S.Wrapper>
    </S.LoginContainer>
  );
};

export default Container;
