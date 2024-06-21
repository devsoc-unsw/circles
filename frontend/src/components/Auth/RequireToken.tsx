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
    queryKey: ['degree', 'isSetup'], // TODO-OLLI(pm): fix this key, including userId
    queryFn: () => getUserIsSetup(token!),
    enabled: token !== undefined,
    refetchOnWindowFocus: 'always',
    throwOnError: (e) => !isAxiosError(e) || e.response?.status !== 401
  });
  // TODO-OLLI(pm): multitab support is hard

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

  if (token === undefined) {
    return <Navigate to={unsetTo ?? '/login'} />;
  }

  if (error) {
    // must be a 401 axios error, even though it should be auto refreshing, so likely session died for other reasons and couldnt notice it...
    // something like a logout from another tab
    // TODO-OLLI(pm): do we want to do better handling here like redirect, clear cache and unset? maybe redirect to logout when that is robust
    // TODO-OLLI(pm): especially this could just lead to infinite reloading if backend bugs and never gives good session token
    // potential solution is just a dismissable popup, once we have proper error support for all other queries.
    window.location.reload();
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
