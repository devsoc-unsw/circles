import React from 'react';
import { inDev } from 'config/constants';
import Footer from './FooterSection/Footer';
import GetInvolved from './GetInvolved';
import Hero from './Hero';
import HowToUse from './HowToUse';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';

const LandingPage = () => (
  <>
    <Hero />
    <KeyFeaturesSection />
    {inDev && <InteractiveViewSection />}
    <HowToUse />
    <GetInvolved />
    <Footer />
  </>
);

export default LandingPage;
