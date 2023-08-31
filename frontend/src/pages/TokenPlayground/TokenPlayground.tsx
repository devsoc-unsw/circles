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

const TokenPlayground = () => {
  const [localToken, setLocalToken] = useState<string>('NOT GOTTEN');
  useEffect(() => {
    const tokener = async () => {
      const t = await getToken();
      setLocalToken(t);
    };
    tokener();
  }, []);

  const dispatch = useDispatch();

  const setGlobalToken = (t: string) => {
    dispatch(setToken(t));
    setLocalToken(t);
  };

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
      </div>
    </PageTemplate>
  );
};

export default TokenPlayground;
