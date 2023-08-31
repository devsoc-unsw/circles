import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { checkTokenStatus, TokenStatus } from 'utils/api/auth';
import openNotification from 'utils/openNotification';
import PageLoading from 'components/PageLoading';
import { setToken } from 'reducers/settingsSlice';

type Props = {
  needSetup?: boolean;
};

const RequireToken = ({ needSetup }: Props) => {
  // TODO: do we want to move this to loading?
  // TODO: do we want to navigate away from login pages too?
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const determineNextPage = async () => {
      const tokenStatus = await checkTokenStatus();
      switch (tokenStatus) {
        case TokenStatus.UNSET:
          navigate('/login');
          break;
        case TokenStatus.INVALID:
          dispatch(setToken(''));
          openNotification({
            type: 'error',
            message: 'Error',
            description: 'You must be logged in before visiting this page 🙂'
          });
          navigate('/login');
          break;
        case TokenStatus.NOTSETUP:
          if (needSetup) {
            openNotification({
              type: 'warning',
              message: 'Warning',
              description: 'You must setup your degree before visiting this page 🙂'
            });
            navigate('/degree-wizard');
          } else {
            setLoading(true);
          }
          break;
        case TokenStatus.VALID:
          setLoading(true);
          break;
        default:
          break;
      }
    };
    determineNextPage();
  }, [needSetup, dispatch, navigate]);

  return loading ? <Outlet /> : <PageLoading />;
};

export default RequireToken;
