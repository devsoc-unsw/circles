import React, { useCallback, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { refreshTokens } from 'utils/api/auth';
import PageLoading from 'components/PageLoading';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectIdentity, unsetIdentity, updateIdentityWithAPIRes } from 'reducers/identitySlice';

const IdentityProvider = () => {
  const dispatch = useAppDispatch();
  const { expiresAt } = useAppSelector(selectIdentity) ?? {};
  const [loading, setLoading] = useState(true);

  const updateToken = useCallback(async () => {
    try {
      const newIdentity = await refreshTokens();

      dispatch(updateIdentityWithAPIRes(newIdentity));
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 401) {
        dispatch(unsetIdentity());
      } else {
        throw e;
      }
    }
  }, [dispatch]);

  useEffect(() => {
    const initialRefresh = async () => {
      setLoading(true);
      await updateToken();
      setLoading(false);
    };

    initialRefresh();
  }, [updateToken]);

  useEffect(() => {
    // silent refresh, don't set loading
    if (expiresAt === undefined) {
      return () => {};
    }

    const refreshPeriod = Math.floor((expiresAt * 1000 - Date.now()) * 0.9);
    const timeout = setTimeout(updateToken, Math.max(refreshPeriod, 60000));
    // const timeout = setTimeout(updateToken, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, [updateToken, expiresAt]);

  return loading ? <PageLoading /> : <Outlet />;
};

export default IdentityProvider;
