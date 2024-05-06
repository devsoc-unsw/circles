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
import axios from 'axios';
import { guestLogin, refreshTokens } from 'utils/api/auth';
import { Link, useOutletContext } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectToken, unsetIdentity, updateIdentityWithAPIRes } from 'reducers/identitySlice';
import useToken from 'hooks/useToken';

const TokenPlayground = ({ allowUnset }: { allowUnset?: boolean }) => {
  // const realToken = useAppSelector(selectToken);
  const realToken = useToken({ allowUnset: !!allowUnset });
  const [authURL, setAuthURL] = useState<string>('');
  const dispatch = useAppDispatch();

  console.log('token playground load');

  const newGuestToken = async () => {
    const res = await guestLogin();

    dispatch(updateIdentityWithAPIRes(res));
  };

  const refreshSessionToken = async () => {
    const res = await refreshTokens();

    dispatch(updateIdentityWithAPIRes(res));
  };

  const unsetToken = () => {
    dispatch(unsetIdentity());
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
    </>
  );
};

export default TokenPlayground;
