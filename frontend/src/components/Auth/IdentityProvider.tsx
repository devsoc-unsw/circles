import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { refreshTokens } from 'utils/api/auth';
import PageLoading from 'components/PageLoading';
import { setToken } from 'reducers/settingsSlice';

const IdentityProvider = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateToken = async () => {
      try {
        const identity = await refreshTokens();

        dispatch(setToken(identity.session_token));
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 401) {
          dispatch(setToken(null));
          return;
        }

        throw e;
      }

      setLoading(false);
    };

    updateToken();
  }, [dispatch]);

  return loading ? <PageLoading /> : <Outlet />;
};

export default IdentityProvider;
