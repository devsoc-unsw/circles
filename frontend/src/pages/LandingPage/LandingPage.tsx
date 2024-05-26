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
    refetchOnWindowFocus: 'always'
  });

  const nextPage = useMemo(() => {
    if (token === undefined || userIsSetup === undefined) {
      return '/login';
    }

    return userIsSetup ? '/term-planner' : '/degree-wizard';
  }, [token, userIsSetup]);

  if (error) {
    // api call failed, even though it should be auto refreshing, so likely session died for other reasons and couldnt notice it...
    // TODO-OLLI: do we want to do better handling here like redirect, clear cache and unset? maybe redirect to logout when that is robust
    // TODO-OLLI: we can also use throwOnError here... o:
    if (isAxiosError(error) && error.response?.status === 401) {
      window.location.reload();
    } else {
      throw error;
    }
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
