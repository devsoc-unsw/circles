/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */
import React, { useState, useEffect, useRef } from 'react';
// import axiosRequest from "config/axios";
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';
import { setToken } from 'reducers/settingsSlice';

// import MetaTags from "react-meta-tags";
import './index.less';
import PageTemplate from 'components/PageTemplate';
import { getToken } from 'utils/api/userApi';
import axios from 'axios';
import { nanoid } from 'nanoid';

const TokenPlayground = () => {
  const [localToken, setLocalToken] = useState<string>('NOT GOTTEN');
  const [csesocToken, setCSESocToken] = useState<string>('NOT GOTTEN');
  const stateParam = useRef<string>(nanoid(24));

  useEffect(() => {
    console.log(stateParam.current);
    localStorage.setItem('csesoc-state-param', stateParam.current);
  }, []);

  useEffect(() => {
    const csesoc = localStorage.getItem('csesoc-last-token');
    if (csesoc) {
      setCSESocToken(csesoc);
    }

    const tokener = async () => {
      const t = await getToken();
      try {
        const tokenRes = await axios.get<string>('/auth/exampleTokenExtractionHeader', {
          headers: { Authentication: `Bearer ${t}` }
        });
        console.log(tokenRes.data);
      } catch (e) {
        console.info(e);
      }
      setLocalToken(t);
    };
    tokener();
  }, []);

  const dispatch = useDispatch();

  const setGlobalToken = (t: string) => {
    dispatch(setToken(t));
    setLocalToken(t);
  };

  // const state = 'randomstatestring';
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
        <button onClick={() => setGlobalToken('')} type="button">
          unset token
        </button>
        <button onClick={() => setGlobalToken('invalidtoken')} type="button">
          set token to invalid
        </button>
        <button onClick={() => setGlobalToken('emptytoken')} type="button">
          set token to valid not setup
        </button>
        <button onClick={() => setGlobalToken('loltemptoken')} type="button">
          set token to valid setup
        </button>
        <button onClick={() => setGlobalToken(csesocToken)} type="button">
          set token to my csesoc
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
