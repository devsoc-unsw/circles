import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from 'utils/api/auth';
import PageLoading from 'components/PageLoading';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectToken, unsetIdentity } from 'reducers/identitySlice';

const Logout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const token = useAppSelector(selectToken);
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      if (token !== undefined) {
        // TODO-OLLI: we want to redirect even if this 401s, so catch error
        await logout(token);
      }

      queryClient.clear();
      dispatch(unsetIdentity());
      navigate('/', { replace: true });
    };

    performLogout();
  }, [token, dispatch, queryClient, navigate]);

  return <PageLoading />;
};

export default Logout;
