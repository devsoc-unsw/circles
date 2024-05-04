/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */
import React, { useState, useEffect, useRef } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';

// import MetaTags from "react-meta-tags";
import './index.less';
import PageTemplate from 'components/PageTemplate';
import { getToken } from 'utils/api/userApi';
import axios from 'axios';
import { guestLogin, refreshTokens } from 'utils/api/auth';
import { Link, useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectToken, updateIdentityWithAPIRes } from 'reducers/identitySlice';

const TokenPlayground = () => {
  const [localToken, setLocalToken] = useState<string | undefined>(undefined);
  const realToken = useAppSelector(selectToken);
  const [authURL, setAuthURL] = useState<string>('');
  const dispatch = useAppDispatch();

  const scope = useOutletContext();
  console.log('scope', scope);

  console.log('token playground load');
  // console.log(getToken());

  // useEffect(() => {
  //   const csesoc = localStorage.getItem('csesoc-last-token');
  //   if (csesoc) {
  //     setCSESocToken(csesoc);
  //   }

  //   const tokener = async () => {
  //     const t = await getToken();
  //     try {
  //       const tokenRes = await axios.get<string>('/auth/exampleTokenExtractionHeader', {
  //         headers: { Authentication: `Bearer ${t}` }
  //       });
  //       console.log(tokenRes.data);
  //     } catch (e) {
  //       console.info(e);
  //     }
  //     setLocalToken(t);
  //   };
  //   tokener();
  // }, []);

  // const setGlobalToken = (t: string) => {
  //   dispatch(setToken(t));
  //   setLocalToken(t);
  // };

  const newGuestToken = async () => {
    const res = await guestLogin();

    dispatch(updateIdentityWithAPIRes(res));
  };

  const refreshSessionToken = async () => {
    // TODO: try this
    const res = await refreshTokens();
    // setCSESocToken(res.session_token);
    // setLocalToken(res.session_token);

    dispatch(updateIdentityWithAPIRes(res));
  };

  const checkSessionToken = async () => {
    console.log('checking session token');
    if (localToken === null) {
      throw Error('lol no token');
    }

    const res = await axios.get('/auth/validatedUser', {
      headers: { Authorization: `Bearer ${localToken}` }
    });
    console.log(res.data);
  };

  // useEffect(() => {
  //   const getAuthURL = async () => {
  //     const res = await axios.get<string>('/auth/authorization_url', { withCredentials: true });
  //     setAuthURL(res.data);
  //   };

  //   getAuthURL();
  // }, []);

  return (
    <PageTemplate>
      <div>RealToken: &apos;{realToken ?? 'null'}&apos;</div>
      <div>LocalToken: &apos;{localToken ?? 'null'}&apos;</div>
      <div>
        <button onClick={() => setLocalToken(undefined)} type="button">
          unset token
        </button>
        <button onClick={() => setLocalToken(realToken)} type="button">
          set token to my csesoc
        </button>
        <button onClick={newGuestToken} type="button">
          new guest token
        </button>
        <button onClick={refreshSessionToken} type="button">
          refresh session token
        </button>
        <button onClick={checkSessionToken} type="button">
          check session token
        </button>
      </div>
      <div>
        <a href={authURL}>Login with csesoc</a>
      </div>
      <div>
        <Link to="/token-required">to token required page</Link>
      </div>
      <div>
        <Link to="/token-needsetup">to token needsetup page</Link>
      </div>
    </PageTemplate>
  );
};

export default TokenPlayground;
