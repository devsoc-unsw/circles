import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getUserIsSetup } from 'utils/api/userApi';
import PageLoading from 'components/PageLoading';
import { inDev } from 'config/constants';
import useToken from 'hooks/useToken';
import Footer from './FooterSection/Footer';
import GetInvolved from './GetInvolved';
import Hero from './Hero';
import HowToUse from './HowToUse';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';
import SponsorSection from './SponsorSection';

const LandingPage = () => {
  // determine our next location
  const token = useToken({ allowUnset: true });

  const {
    data: userIsSetup,
    isPending,
    error
  } = useQuery({
    queryKey: ['degree', 'isSetup'], // TODO-OLLI: fix this key, including userId
    queryFn: () => getUserIsSetup(token!),
    enabled: token !== undefined,
    refetchOnWindowFocus: 'always',
    throwOnError: (e) => !isAxiosError(e) || e.response?.status !== 401
  });

  const nextPage = useMemo(() => {
    if (token === undefined || userIsSetup === undefined) {
      return '/login';
    }

    return userIsSetup ? '/term-planner' : '/degree-wizard';
  }, [token, userIsSetup]);

  // TODO-OLLI: do we actually want to refresh here? or just silently move on, mayb bad ux
  if (error) {
    // must be a 401 axios error, even though it should be auto refreshing, so likely session died for other reasons and couldnt notice it...
    // TODO-OLLI: do we want to do better handling here like redirect, clear cache and unset? maybe redirect to logout when that is robust
    window.location.reload();
  }

  if (isPending && token !== undefined) {
    return <PageLoading />;
  }

  return (
    <>
      <Hero startLocation={nextPage} />
      <SponsorSection />
      <KeyFeaturesSection />
      {inDev && <InteractiveViewSection />}
      <HowToUse />
      <GetInvolved />
      <Footer />
    </>
  );
};

export default LandingPage;
