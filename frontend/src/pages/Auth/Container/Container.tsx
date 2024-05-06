import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { guestLogin as guestLoginRequest } from 'utils/api/auth';
import { userLogin } from 'utils/api/userApi';
import BackButton from 'assets/back.svg';
import SplashArt from 'assets/splashart.svg';
import { updateIdentityWithAPIRes } from 'reducers/identitySlice';
import S from './styles';

const Container = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const guestLogin = useCallback(async () => {
    const res = await guestLoginRequest();

    dispatch(updateIdentityWithAPIRes(res));
    navigate('/degree-wizard');
  }, [navigate, dispatch]);

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
            <S.GuestButton onClick={guestLogin}>Continue as guest</S.GuestButton>
          </S.Login>
        </S.Right>
      </S.Wrapper>
    </S.LoginContainer>
  );
};

export default Container;
