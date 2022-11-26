import React from 'react';
import dragIconSrc from 'assets/LandingPage/dragIcon.png';
import flagIconSrc from 'assets/LandingPage/flagIcon.png';
import padlockIconSrc from 'assets/LandingPage/padlockIcon.png';
import BlobBackground from './BlobBackground';
import S from './styles';

const KeyFeaturesSection = () => {
  return (
    <>
      <S.LandingPageTitle>Introducing our features</S.LandingPageTitle>
      <S.CardContainer>
        <BlobBackground />
        <S.Card>
          <S.IconContainer color="#eae5ed">
            <img src={dragIconSrc} alt="" width={50} height={50} />
          </S.IconContainer>
          <S.LandingPageSubtitle startColor="#cabade" endColor="#9e88ba">
            Drag N&apos; Drop
          </S.LandingPageSubtitle>
          <S.Divider color="#c3b3c9" />
          <S.Content>
            Drag and drop functionality to make planning an intuitive and easy process
          </S.Content>
        </S.Card>
        <S.Card>
          <S.IconContainer color="#eddafc">
            <img src={flagIconSrc} alt="" width={50} height={50} />
          </S.IconContainer>
          <S.LandingPageSubtitle startColor="#9b5dea" endColor="#dbe2fc">
            Track progress
          </S.LandingPageSubtitle>
          <S.Divider color="#f2ccff" />
          <S.Content>
            Plan ahead with our progression tracker, and track how far you&apos;ve gone in your
            degree
          </S.Content>
        </S.Card>
        <S.Card>
          <S.IconContainer color="#d4ffdc">
            <img src={padlockIconSrc} alt="" width={50} height={50} />
          </S.IconContainer>
          <S.LandingPageSubtitle startColor="#9fecae" endColor="#93d392">
            Prereq Validation
          </S.LandingPageSubtitle>
          <S.Divider color="#a3ebb1" />
          <S.Content>
            Verify you meet all the pre-requisites required to take any given course
          </S.Content>
        </S.Card>
      </S.CardContainer>
    </>
  );
};

export default KeyFeaturesSection;
