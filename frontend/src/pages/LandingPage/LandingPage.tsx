import React from 'react';
import InteractiveViewSection from './InteractiveViewSection';
import KeyFeaturesSection from './KeyFeaturesSection';
import S from './styles';

const LandingPage = () => (
  <S.LandingPageContainer>
    <KeyFeaturesSection />
    <InteractiveViewSection />
    <br />
  </S.LandingPageContainer>
);

export default LandingPage;
