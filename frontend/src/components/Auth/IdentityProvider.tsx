import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { refreshTokens } from 'utils/api/auth';
import PageLoading from 'components/PageLoading';
import { useAppDispatch } from 'hooks';
import { unsetIdentity, updateIdentityWithAPIRes } from 'reducers/identitySlice';

const IdentityProvider = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateToken = async () => {
      try {
        const identity = await refreshTokens();

        dispatch(updateIdentityWithAPIRes(identity));
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 401) {
          dispatch(unsetIdentity());
        } else {
          throw e;
        }
      }

      setLoading(false);
    };

    updateToken();
  }, [dispatch]);

  return loading ? <PageLoading /> : <Outlet />;
};

export default IdentityProvider;
