import React from 'react';
import styled from 'styled-components';
import { inDev } from 'config/constants';
import Footer from './FooterSection/Footer';
import GetInvolved from './GetInvolved';
import Hero from './Hero';
import HowToUse from './HowToUse';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';
import SponsorSection from './SponsorSection';

const LandingPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 100px;
`;

const LandingPage = () => (
  <LandingPageWrapper>
    <Hero />
    <SponsorSection />
    <KeyFeaturesSection />
    {inDev && <InteractiveViewSection />}
    <HowToUse />
    <GetInvolved />
    <Footer />
  </LandingPageWrapper>
);

export default LandingPage;
