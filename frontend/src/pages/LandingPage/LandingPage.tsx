import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
    queryKey: ['degree', 'isSetup'], // TODO-OLLI(pm): fix this key, including userId
    queryFn: () => getUserIsSetup(token!),
    enabled: token !== undefined,
    refetchOnWindowFocus: 'always'
  });

  const nextPage = useMemo(() => {
    if (token === undefined || userIsSetup === undefined || error) {
      // choose to throw them at login page if there is an error here, and expect it to retry/deal with it there
      // to avoid bad ux from reloading or error boundaries
      return '/login';
    }

    return userIsSetup ? '/course-selector' : '/degree-wizard';
  }, [token, userIsSetup, error]);

  if (error) {
    // eslint-disable-next-line no-console
    console.error(error);
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
