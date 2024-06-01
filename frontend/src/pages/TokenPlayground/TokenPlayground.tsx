/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */
import React, { useState, useEffect, useRef, useCallback } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';

// import MetaTags from "react-meta-tags";
import PageTemplate from 'components/PageTemplate';
import axios, { isAxiosError } from 'axios';
import { guestLogin, refreshTokens, withAuthorization } from 'utils/api/auth';
import { Link, useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectToken, unsetIdentity, updateIdentityWithAPIRes } from 'reducers/identitySlice';
import useToken from 'hooks/useToken';
import openNotification from 'utils/openNotification';

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = import.meta.env.VITE_BACKEND_API_BASE_URL;

export const getUserIsSetup = async (token: string): Promise<boolean> => {
  const res = await axiosInstance.get<boolean>('/user/isSetup', {
    headers: { ...withAuthorization(token) }
  });

  return res.data;
};

const TokenPlayground = ({ allowUnset }: { allowUnset?: boolean }) => {
  // const realToken = useAppSelector(selectToken);
  const realToken = useToken({ allowUnset });
  const [authURL, setAuthURL] = useState<string>('');
  const dispatch = useAppDispatch();

  const newGuestToken = async () => {
    const res = await guestLogin();

    dispatch(updateIdentityWithAPIRes(res));
  };

  const refreshSessionToken = useCallback(async () => {
    const res = await refreshTokens();

    dispatch(updateIdentityWithAPIRes(res));
    return res.session_token;
  }, [dispatch]);

  const unsetToken = () => {
    dispatch(unsetIdentity());
  };

  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          // try refreshing
          // https://medium.com/@barisberkemalkoc/axios-interceptor-intelligent-db46653b7303

          console.log('-- interceptor refreshing');

          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });

          const newToken = await refreshSessionToken();

          const oldRequest = { ...error.config };
          oldRequest.headers?.setAuthorization(withAuthorization(newToken).Authorization);
          return axios.request(oldRequest);
        }

        return Promise.reject(error);
      }
    );

    return () => axiosInstance.interceptors.response.eject(interceptor);
  }, [refreshSessionToken]);

  const printSetup = async () => {
    if (realToken !== undefined) {
      try {
        const res = await getUserIsSetup(realToken);
        console.log(res);
        openNotification({ type: 'success', message: 'is setup?', description: `${res}` });
      } catch (e) {
        if (isAxiosError(e)) {
          openNotification({
            type: 'error',
            message: 'is setup?',
            description: e.response?.status ?? 'AXIOS ERROR'
          });
        }
      }
    } else {
      openNotification({ type: 'warning', message: 'is setup?', description: 'NO TOKEN' });
    }
  };

  return (
    <>
      <div>RealToken: &apos;{realToken ?? 'null'}&apos;</div>
      <div>
        <button onClick={unsetToken} type="button">
          unset token
        </button>
        <button onClick={newGuestToken} type="button">
          new guest token
        </button>
        <button onClick={refreshSessionToken} type="button">
          refresh session token
        </button>
        <button onClick={printSetup} type="button">
          try out token
        </button>
      </div>
      <div>
        <a href={authURL}>Login with csesoc</a>
      </div>
      <div>
        <Link to="/tokens">to token playground</Link>
      </div>
      <div>
        <Link to="/token-required">to token required page</Link>
      </div>
      <div>
        <Link to="/token-needsetup">to token needsetup page</Link>
      </div>
      <div>
        <Link to="/token-notallowed">to no token allowed page</Link>
      </div>
    </>
  );
};

export default TokenPlayground;
