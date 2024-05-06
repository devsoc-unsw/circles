import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkTokenStatus, TokenStatus } from 'utils/api/auth';
import openNotification from 'utils/openNotification';
import PageLoading from 'components/PageLoading';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectToken, unsetIdentity } from 'reducers/identitySlice';

type Props = {
  needSetup?: boolean;
  unsetTo?: string;
  expiredTo?: string;
  notsetupTo?: string;
};

const RequireToken = ({ needSetup, unsetTo, expiredTo, notsetupTo }: Props) => {
  // TODO: do we want to navigate away from login pages too?
  // TODO: maybe we could merge this into useToken??
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);

  const { isPending, data: tokenStatus } = useQuery({
    queryFn: () => checkTokenStatus(token),
    queryKey: ['degree', 'user', 'state', { token }], // TODO: temporary key
    throwOnError: true
    // staleTime: 60 * 5 * 1000 // TODO: re add when everything is done
  });

  useEffect(() => {
    // TODO: wont need this when we get new notification hook
    if (tokenStatus === TokenStatus.UNSET || tokenStatus === TokenStatus.EXPIRED) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: 'You must be logged in before visiting this page 🙂'
      });
    } else if (tokenStatus === TokenStatus.NOTSETUP && needSetup) {
      openNotification({
        type: 'warning',
        message: 'Warning',
        description: 'You must setup your degree before visiting this page 🙂'
      });
    }
  }, [tokenStatus, needSetup]);

  if (isPending || tokenStatus === undefined) {
    return <PageLoading />;
  }

  if (tokenStatus === TokenStatus.UNSET) {
    return <Navigate to={unsetTo ?? '/login'} />;
  }

  if (tokenStatus === TokenStatus.EXPIRED) {
    // should rarely happen since tokens should be auto-refreshed
    dispatch(unsetIdentity());
    return <Navigate to={expiredTo ?? unsetTo ?? '/login'} />;
  }

  if (tokenStatus === TokenStatus.NOTSETUP && needSetup) {
    return <Navigate to={notsetupTo ?? '/degree-wizard'} />;
  }

  return <Outlet />;
};

export default RequireToken;
