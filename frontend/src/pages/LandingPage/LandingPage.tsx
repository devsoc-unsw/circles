import React from 'react';
import Footer from './FooterSection/Footer';
import Hero from './Hero';
import HowToUse from './HowToUse';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';

const LandingPage = () => (
  <>
    <Hero />
    <KeyFeaturesSection />
    <InteractiveViewSection />
    <HowToUse />
    <Footer />
  </>
);

export default LandingPage;
