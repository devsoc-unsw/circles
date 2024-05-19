import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkTokenStatus, TokenStatus } from 'utils/api/auth';
import openNotification from 'utils/openNotification';
import PageLoading from 'components/PageLoading';
import { useAppSelector } from 'hooks';
import { selectIdentity } from 'reducers/identitySlice';

type Props = {
  needSetup?: boolean;
  unsetTo?: string;
  expiredTo?: string;
  notsetupTo?: string;
};

const RequireToken = ({ needSetup, unsetTo, expiredTo, notsetupTo }: Props) => {
  const { token, userId } = useAppSelector(selectIdentity) ?? {};

  // TODO-OLLI: strip out undefined check from checkTokenStatus
  const { isPending, data: tokenStatus } = useQuery({
    queryFn: () => checkTokenStatus(token),
    queryKey: ['degree', 'user', 'state', { userId }], // TODO-OLLI: temporary key
    throwOnError: true
    // staleTime: 60 * 5 * 1000 // TODO-OLLI: re add when everything is done
  });

  useEffect(() => {
    // TODO-OLLI: wont need this when we get new notification hook
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

  // TODO-OLLI: make sure that all navigates across entire app point to correct locations now
  if (isPending || tokenStatus === undefined) {
    return <PageLoading />;
  }

  if (tokenStatus === TokenStatus.UNSET) {
    return <Navigate to={unsetTo ?? '/login'} />;
  }

  if (tokenStatus === TokenStatus.EXPIRED) {
    // should rarely happen since tokens should be auto-refreshed
    return <Navigate to={expiredTo ?? '/logout'} />;
  }

  if (tokenStatus === TokenStatus.NOTSETUP && needSetup) {
    return <Navigate to={notsetupTo ?? '/degree-wizard'} />;
  }

  return <Outlet />;
};

export default RequireToken;
