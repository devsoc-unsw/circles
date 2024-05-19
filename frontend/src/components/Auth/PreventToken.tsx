import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { checkTokenStatus, TokenStatus } from 'utils/api/auth';
import PageLoading from 'components/PageLoading';
import { useAppSelector } from 'hooks';
import { selectToken } from 'reducers/identitySlice';

type Props = {
  setTo?: string;
};

const PreventToken = ({ setTo }: Props) => {
  const token = useAppSelector(selectToken);

  // TODO-OLLI: should we separate out the undefined check from this?
  const { isPending, data: tokenStatus } = useQuery({
    queryFn: () => checkTokenStatus(token),
    queryKey: ['degree', 'user', 'state', { token }], // TODO-OLLI: temporary key
    throwOnError: true
    // staleTime: 60 * 5 * 1000 // TODO-OLLI: re add when everything is done
  });

  if (isPending || tokenStatus === undefined) {
    return <PageLoading />;
  }

  if (tokenStatus === TokenStatus.EXPIRED) {
    // shouldnt really happen
    return <Navigate to={setTo ?? '/logout'} />;
  }

  if (tokenStatus === TokenStatus.NOTSETUP) {
    return <Navigate to={setTo ?? '/degree-wizard'} />;
  }

  if (tokenStatus === TokenStatus.SETUP) {
    return <Navigate to={setTo ?? '/course-selector'} />;
  }

  return <Outlet />;
};

export default PreventToken;

// can't just check if token is undefined since
// - we dispatch the token update and then navigate inside guestLogin
// - but the before the navigate, this component rerenders
// - meaning that we get the notification and navigate, before the login navigates
// solution?
// - useQuery to add some delay (actually needed since we dont know where we want to go)
// - dont navigate in container, rely on this navigate and remove the notification
// - perform the actual fetch dispatch on a different page and guestLogin just navigates there
// -.. move guestLogin into a thunk, and .then chain the navigate? not sure if this works
// -/- move to a data router and then we have access to the useNavigation...
// - combine the PreventToken into the login page, and then no parent to rerender
