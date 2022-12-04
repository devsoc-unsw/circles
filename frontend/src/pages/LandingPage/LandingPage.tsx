import React from 'react';
import Footer from './FooterSection/Footer';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';
import S from './styles';

const LandingPage = () => (
  <S.LandingPageContainer>
    <KeyFeaturesSection />
    <InteractiveViewSection />
    <Footer />
  </S.LandingPageContainer>
);

export default LandingPage;
