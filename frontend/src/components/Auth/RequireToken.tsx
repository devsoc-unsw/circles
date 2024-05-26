import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getUserIsSetup } from 'utils/api/userApi';
import openNotification from 'utils/openNotification';
import PageLoading from 'components/PageLoading';
import { useAppSelector } from 'hooks';
import { selectIdentity } from 'reducers/identitySlice';

// TODO-OLLI: remove these unsetTo props
type Props = {
  needSetup?: boolean;
  unsetTo?: string;
  notsetupTo?: string;
};

const RequireToken = ({ needSetup, unsetTo, notsetupTo }: Props) => {
  const { token } = useAppSelector(selectIdentity) ?? {};

  const {
    isPending,
    data: isSetup,
    error
  } = useQuery({
    queryKey: ['degree', 'isSetup'], // TODO-OLLI: fix this key, including userId
    queryFn: () => getUserIsSetup(token!),
    enabled: token !== undefined,
    refetchOnWindowFocus: 'always'
  });

  useEffect(() => {
    // TODO-OLLI(pm): wont need this when we get new notification hook
    if (token === undefined || !!error) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: 'You must be logged in before visiting this page 🙂'
      });
    } else if (isSetup === false && !!needSetup) {
      openNotification({
        type: 'warning',
        message: 'Warning',
        description: 'You must setup your degree before visiting this page 🙂'
      });
    }
  }, [token, isSetup, error, needSetup]);

  // TODO-OLLI: make sure that all navigates across entire app point to correct locations now
  if (token === undefined) {
    return <Navigate to={unsetTo ?? '/login'} />;
  }

  if (error) {
    // api call failed, even though it should be auto refreshing, so likely session died for other reasons and couldnt notice it...
    // TODO-OLLI: do we want to do better handling here like redirect, clear cache and unset? maybe redirect to logout when that is robust
    if (isAxiosError(error) && error.response?.status === 401) {
      window.location.reload();
    } else {
      throw error;
    }
  }

  if (isPending || isSetup === undefined) {
    return <PageLoading />;
  }

  if (!isSetup && !!needSetup) {
    return <Navigate to={notsetupTo ?? '/degree-wizard'} />;
  }

  return <Outlet />;
};

export default RequireToken;
