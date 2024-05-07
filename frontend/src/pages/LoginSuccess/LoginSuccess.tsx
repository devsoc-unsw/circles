/* eslint-disable */
/* eslint no-console: 'error' */

import React, { useState, useEffect } from 'react';
// import axiosRequest from 'config/axios';
import jwt_decode from 'jwt-decode';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from 'config/store';

// import MetaTags from 'react-meta-tags';
import PageTemplate from 'components/PageTemplate';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { exchangeAuthCode } from 'utils/api/auth';

const LoginSuccess = () => {
  const [query, _] = useSearchParams();
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  console.log(query);

  useEffect(() => {
    const exchangeCode = async () => {
      // get the state param and compare it
      // localStorage.removeItem('csesoc-state-param');

      // const stateParam = query.get('state');
      // const codeParam = query.get('code');
      // const scopeParam = query.get('scope');
      // if (!expectedState || expectedState !== stateParam) {
      //   setError(`state doesnt match: ${expectedState} != ${stateParam}`);
      //   return;
      // } else if (!codeParam || scopeParam !== 'openid offline_access') {
      //   setError(`other params are wrong: ${codeParam}, ${scopeParam}`);
      //   return;
      // }

      // exchange the code
      let session_token = '';
      try {
        const res = await exchangeAuthCode(Object.fromEntries(query.entries()));
        session_token = res.session_token
      } catch (e) {
        setError('auth code exchange failed');
        console.error(e);
        return;
      }

      // we now have a access token, set it as our token
      // dispatch(setToken(session_token));
      setError(`NONE: ${session_token}`);
    }

    exchangeCode();
  }, [query]);

  return (
    <PageTemplate>
      <div>
        <div>
          '{query.get('code')}'
        </div>
        <div>
          Error: '{error}'
        </div>
        <Link to="/tokens">tokens playground</Link>
      </div>
    </PageTemplate>
  );
};

export default LoginSuccess;
