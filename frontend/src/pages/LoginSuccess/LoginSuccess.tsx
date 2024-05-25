import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CSELogin } from 'utils/api/auth';
import { getUserIsSetup } from 'utils/api/userApi';
import PageLoading from 'components/PageLoading';
import { unsetIdentity, updateIdentityWithAPIRes } from 'reducers/identitySlice';

const LoginSuccess = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [query] = useSearchParams();

  useEffect(() => {
    const exchangeCode = async () => {
      try {
        const identity = await CSELogin(Object.fromEntries(query.entries()));

        dispatch(updateIdentityWithAPIRes(identity));
        // TODO-OLLI: could use a conditional useQuery too
        const userIsSetup = await queryClient.fetchQuery({
          queryKey: ['degree', 'isSetup'], // TODO-OLLI: fix this key
          queryFn: () => getUserIsSetup(identity.session_token)
        });

        navigate(userIsSetup ? '/course-selector' : '/degree-wizard', { replace: true });
      } catch (e) {
        dispatch(unsetIdentity());

        throw e;
      }
    };

    queryClient.clear(); // TODO-OLLI: only need to clear user stuff
    exchangeCode();
  }, [query, dispatch, navigate, queryClient]);

  return <PageLoading />;

  // return (
  //   <PageTemplate>
  //     <div>
  //       <div>
  //         '{query.get('code')}'
  //       </div>
  //       <div>
  //         Error: '{error}'
  //       </div>
  //       <Link to="/tokens">tokens playground</Link>
  //     </div>
  //   </PageTemplate>
  // );
};

export default LoginSuccess;
