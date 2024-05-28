import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getUserIsSetup } from 'utils/api/userApi';
import PageLoading from 'components/PageLoading';
import { useAppSelector } from 'hooks';
import { selectToken } from 'reducers/identitySlice';

type Props = {
  setTo?: string;
};

const PreventToken = ({ setTo }: Props) => {
  const token = useAppSelector(selectToken);

  const {
    isPending,
    data: isSetup,
    error
  } = useQuery({
    queryKey: ['degree', 'isSetup'], // TODO-OLLI: fix this key, including userId
    queryFn: () => getUserIsSetup(token!),
    enabled: token !== undefined,
    refetchOnWindowFocus: 'always',
    throwOnError: (e) => !isAxiosError(e) || e.response?.status !== 401
  });

  if (token === undefined) {
    // good
    return <Outlet />;
  }

  if (error) {
    // must be a 401 axios error, even though it should be auto refreshing, so likely session died for other reasons and couldnt notice it...
    // TODO-OLLI: do we want to do better handling here like redirect, clear cache and unset? maybe redirect to logout when that is robust
    window.location.reload();
  }

  if (isPending || isSetup === undefined) {
    return <PageLoading />;
  }

  return isSetup ? (
    <Navigate to={setTo ?? '/course-selector'} />
  ) : (
    <Navigate to={setTo ?? '/degree-wizard'} />
  );
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
