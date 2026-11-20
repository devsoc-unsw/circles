import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { guestLogin as guestLoginRequest, initiateCSEAuth } from 'utils/api/authApi';
import openNotification from 'utils/openNotification';
import BackButton from 'assets/back.svg';
import SplashArt from 'assets/splashart.svg';
import PageTemplate from 'components/PageTemplate';
import { useAppDispatch } from 'hooks';
import { updateIdentityWithAPIRes } from 'reducers/identitySlice';
import S from './styles';

type APIErrorPayload = {
  detail?: string;
};

const Login = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // TODO-OLLI(pm): what if a user has two tabs open, logs in with one and then logs in with other??
  // similarly with logout and other authentication events
  // https://www.reddit.com/r/howdidtheycodeit/comments/wj9c65/you_signed_in_with_another_tab_or_window_reload/
  // ideas:
  // - broadcastchannel for all auth events
  // - a special cookie/localstorage state to indicate that we are already logged in
  // - onFocus
  // - quick api call before login, although this is probs BAD
  // -- can just check if a refresh token is given at the login routes
  const guestLogin = useCallback(async () => {
    try {
      const res = await guestLoginRequest();

      queryClient.clear();
      dispatch(updateIdentityWithAPIRes(res));
      // NOTE: rely on the PreventToken to do the redirecting
    } catch (error) {
      const description = isAxiosError<APIErrorPayload>(error)
        ? (error.response?.data?.detail ?? 'Unable to create guest session right now.')
        : 'Unable to create guest session right now.';
      openNotification({
        type: 'error',
        message: 'Guest login unavailable',
        description
      });
    }
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
              <S.Title>Login to Circles</S.Title>
              <div>For current UNSW Students</div>
              <S.LoginButton onClick={initiateCSEAuth}>Login with zID</S.LoginButton>
              <S.GuestButton onClick={guestLogin}>Continue as guest</S.GuestButton>
            </S.Login>
          </S.Right>
        </S.Wrapper>
      </S.LoginContainer>
    </PageTemplate>
  );
};

export default Login;
