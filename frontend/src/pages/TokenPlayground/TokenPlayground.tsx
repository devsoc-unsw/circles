/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable simple-import-sort/imports */
import React, { useState, useEffect } from 'react';
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
import * as crypto from 'crypto';

const myGoogleToken =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6ImM3ZTExNDEwNTlhMTliMjE4MjA5YmM1YWY3YTgxYTcyMGUzOWI1MDAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2OTY0OTQ4NTQyNjItaGxydDI4aGJkbXExaW1wOTlkYWZia3ZjZ285YjVsZDAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2OTY0OTQ4NTQyNjItaGxydDI4aGJkbXExaW1wOTlkYWZia3ZjZ285YjVsZDAuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDczMDExMzA3NTkxNDg5OTU4MTciLCJlbWFpbCI6Im9sbGlib3dlcnNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTY5MzY0Mzk2NywibmFtZSI6Im9sbGkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFjSFR0ZE51VXdybnNZYVBmX2loQWVrMmx5TE83aVl4Rk13alk0SnpSbVEyVTZXM0ZNPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Im9sbGkiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTY5MzY0NDI2NywiZXhwIjoxNjkzNjQ3ODY3LCJqdGkiOiIyZDkwYjMxMTJkMTBkZDM2MTY3OGU1MDk4ZjcxODMxYTUyM2QxMDg5In0.IUxtEeLDQkufaCUOLcU3-voGlWZinpPayXGRr7oN4CDy2a_J7dmky4VVtx5DhD6RKsCglzHO7mjT5H6Bf--bX8H7WG8KHbLpBpwF6UEC1P0Pcumcji3MctzRSjG1mbrrl3_PVcAF8Y_YfXf74Gmh9wB-Hq_bFKTyBY5ZXuM8lHoP0lHFbnwIkOicutIbGNhShzjIwjDm_JFtMgREFlLT5d9PVkrtuU7tBnuhpLMk_5K9LEfupmzcl3Y5M3WgPK99GbgWO5ZZSYUtXgyzvoHAPXHlADPLSvGwC7sh_GancV5psbL_YY_-adxY4QbPSAFY-Ih0vchY5wVD7FpZdmr2Zg';
const myCSESocToken =
  'ory_ac_DbQOgX0JpNR98UBg7UDXAndB3-r0_vl6W3lP4h_RBTo.g1QbkXa3FJvt_ZoM7587EuR-AIQjTsSksL7_oW6d_88';

const TokenPlayground = () => {
  const [localToken, setLocalToken] = useState<string>('NOT GOTTEN');
  useEffect(() => {
    const tokener = async () => {
      const t = await getToken();
      try {
        const tokenRes = await axios.get<string>('/auth/exampleTokenExtractionParams', {
          params: { token: t }
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

  const state = 'randomstatestring';
  const cseLoginURL = new URL('https://id.csesoc.unsw.edu.au/oauth2/auth');
  cseLoginURL.searchParams.append('client_id', 'f2f0ee59-3635-4e8c-85d1-fac8afbbf7f1');
  cseLoginURL.searchParams.append('response_type', 'code');
  cseLoginURL.searchParams.append('scope', 'openid');
  cseLoginURL.searchParams.append('redirect_uri', 'http://localhost:3000/login/success/csesoc');
  cseLoginURL.searchParams.append('state', state);

  return (
    <PageTemplate>
      <div>Token: &apos;{localToken}&apos;</div>
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
        <button onClick={() => setGlobalToken(myGoogleToken)} type="button">
          set token to my google
        </button>
        <button onClick={() => setGlobalToken(myCSESocToken)} type="button">
          set token to my csesoc
        </button>
      </div>
      <div>
        <a href={cseLoginURL.toString()}>Login with csesoc</a>
      </div>
    </PageTemplate>
  );
};

export default TokenPlayground;
