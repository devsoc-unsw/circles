import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { guestLogin as guestLoginRequest } from 'utils/api/auth';
import { userLogin } from 'utils/api/userApi';
import BackButton from 'assets/back.svg';
import SplashArt from 'assets/splashart.svg';
import PageTemplate from 'components/PageTemplate';
import { useAppDispatch } from 'hooks';
import { updateIdentityWithAPIRes } from 'reducers/identitySlice';
import S from './styles';

const Container = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const guestLogin = useCallback(async () => {
    const res = await guestLoginRequest();

    queryClient.clear();
    dispatch(updateIdentityWithAPIRes(res));
    // NOTE: rely on the PreventToken to do the redirecting
  }, [dispatch, queryClient]);

  return (
    <PageTemplate showHeader={false}>
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
    </PageTemplate>
  );
};

export default Container;
