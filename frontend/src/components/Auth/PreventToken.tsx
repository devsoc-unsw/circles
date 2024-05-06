import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import openNotification from 'utils/openNotification';
import { useAppSelector } from 'hooks';
import { selectToken } from 'reducers/identitySlice';

type Props = {
  setTo?: string;
};

const PreventToken = ({ setTo }: Props) => {
  const token = useAppSelector(selectToken);

  useEffect(() => {
    if (token !== undefined) {
      openNotification({
        type: 'error',
        message: 'Error',
        description: 'You are already logged in 🙂'
      });
    }
  }, [token]);

  if (token !== undefined) {
    return <Navigate to={setTo ?? '/course-selector'} />;
  }

  return <Outlet />;
};

export default PreventToken;
