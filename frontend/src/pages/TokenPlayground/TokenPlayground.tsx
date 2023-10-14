/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */
import React, { useState, useEffect, useRef } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';
// import { setToken } from 'reducers/settingsSlice';

// import MetaTags from "react-meta-tags";
import './index.less';
import PageTemplate from 'components/PageTemplate';
import { getToken } from 'utils/api/userApi';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { getSessionToken } from 'utils/api/auth';

const TokenPlayground = () => {
  const [localToken, setLocalToken] = useState<string>('NOT GOTTEN');
  const [csesocToken, setCSESocToken] = useState<string>('NOT GOTTEN');
  const stateParam = useRef<string>(nanoid(24));

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

  // const dispatch = useDispatch();

  // const setGlobalToken = (t: string) => {
  //   dispatch(setToken(t));
  //   setLocalToken(t);
  // };

  const refreshSessionToken = async () => {
    // TODO: try this
    const res = await getSessionToken();
    setCSESocToken(res.session_token);
    setLocalToken(res.session_token);
  };

  const checkSessionToken = async () => {
    console.log('checking session token');
    const res = await axios.get('/auth/validatedUser', {
      headers: { Authorization: `Bearer ${localToken}` }
    });
    console.log(res);
  };

  useEffect(() => {
    console.log('state:');
    console.log(stateParam.current);
    localStorage.setItem('csesoc-state-param', stateParam.current);
  }, []);

  useEffect(() => {
    refreshSessionToken();
  }, []);

  const cseLoginURL = new URL('https://id.csesoc.unsw.edu.au/oauth2/auth');
  cseLoginURL.searchParams.append('client_id', 'f2f0ee59-3635-4e8c-85d1-fac8afbbf7f1');
  cseLoginURL.searchParams.append('response_type', 'code');
  cseLoginURL.searchParams.append('scope', 'openid offline_access');
  cseLoginURL.searchParams.append('redirect_uri', 'http://localhost:3000/login/success/csesoc');
  cseLoginURL.searchParams.append('state', stateParam.current);

  return (
    <PageTemplate>
      <div>Token: &apos;{localToken.toString()}&apos;</div>
      <div>
        <button onClick={() => setLocalToken('')} type="button">
          unset token
        </button>
        <button onClick={() => setLocalToken(csesocToken)} type="button">
          set token to my csesoc
        </button>
        <button onClick={refreshSessionToken} type="button">
          refresh session token
        </button>
        <button onClick={checkSessionToken} type="button">
          check session token
        </button>
      </div>
      <div>
        <a href={cseLoginURL.toString()}>Login with csesoc</a>
      </div>
      <div>State: &apos;{stateParam.current}&apos;</div>
    </PageTemplate>
  );
};

export default TokenPlayground;
