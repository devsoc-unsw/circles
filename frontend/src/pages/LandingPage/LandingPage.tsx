import React from 'react';
import Footer from './Footer/Footer';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';
import S from './styles';

const LandingPage = () => (
  <S.LandingPageContainer>
    <KeyFeaturesSection />
    <InteractiveViewSection />
    <br />
    <Footer />
  </S.LandingPageContainer>
);

export default LandingPage;
