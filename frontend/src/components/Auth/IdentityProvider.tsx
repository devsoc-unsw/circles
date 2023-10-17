import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet } from 'react-router-dom';
import { getSessionToken } from 'utils/api/auth';
import PageLoading from 'components/PageLoading';
import { setToken } from 'reducers/settingsSlice';

const IdentityProvider = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('fetching identity:');
    const updateToken = async () => {
      const identity = await getSessionToken();
      console.log(identity);
      setLoading(false);
      if (identity === null) {
        dispatch(setToken(null));
      } else {
        dispatch(setToken(identity.session_token));
      }
    };

    updateToken();
  }, [dispatch]);

  return loading ? <PageLoading /> : <Outlet />;
};

export default IdentityProvider;
