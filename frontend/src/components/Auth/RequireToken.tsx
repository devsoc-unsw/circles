import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { checkTokenStatus, TokenStatus } from 'utils/api/auth';
import openNotification from 'utils/openNotification';
import PageLoading from 'components/PageLoading';
import { useAppDispatch, useAppSelector } from 'hooks';
import { selectToken, unsetIdentity } from 'reducers/identitySlice';

type Props = {
  needSetup?: boolean;
};

const RequireToken = ({ needSetup }: Props) => {
  // TODO: do we want to move this to loading?
  // TODO: do we want to navigate away from login pages too?
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const token = useAppSelector(selectToken); // TODO: dont get this twice

  useEffect(() => {
    const determineNextPage = async () => {
      const tokenStatus = await checkTokenStatus(token);
      switch (tokenStatus) {
        case TokenStatus.UNSET:
          navigate('/tokens');
          break;
        case TokenStatus.INVALID:
          dispatch(unsetIdentity());
          openNotification({
            type: 'error',
            message: 'Error',
            description: 'You must be logged in before visiting this page 🙂'
          });
          navigate('/tokens');
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
            setLoading(false);
          }
          break;
        case TokenStatus.VALID:
          setLoading(false);
          break;
        default:
          break;
      }
    };
    determineNextPage();
  }, [token, needSetup, dispatch, navigate]);

  return loading ? <PageLoading /> : <Outlet />;
};

export default RequireToken;
