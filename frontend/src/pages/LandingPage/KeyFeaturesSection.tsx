import React from 'react';
import drag from '../../assets/LandingPage/KeyFeatures/dragImg.png';
import flag from '../../assets/LandingPage/KeyFeatures/flag.png';
import padlock from '../../assets/LandingPage/KeyFeatures/openPadlock.png';
import S from './styles';

const KeyFeaturesSection = () => {
  return (
    <div>
      <div>
        <svg
          width="850"
          height="546"
          viewBox="0 0 1386 546"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute' }}
          transform="translate(300 100)"
        >
          <path
            d="M367.575 56.6426C-95.7607 17.8601 -48.9425 377.275 117.508 498.025C375.556 685.224 607.177 254.691 1033.21 391.582C1459.25 528.473 1466.06 3.24546e-05 1230.8 0C995.552 -3.24546e-05 819.324 94.4553 367.575 56.6426Z"
            fill="#EFDBFE"
          />
        </svg>
        <svg
          width="900"
          height="546"
          viewBox="0 0 1462 546"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute' }}
          transform="translate(220 40)"
        >
          <path
            d="M387.493 57.0908C-100.95 18.3438 -51.5946 377.43 123.875 498.069C395.908 685.097 640.079 254.958 1089.2 391.724C1538.33 528.49 1545.5 0.500032 1297.5 0.5C1049.5 0.499968 863.722 94.8689 387.493 57.0908Z"
            fill="#E5C2FF"
          />
        </svg>
        <S.LandingPageTitle>Introducing our features</S.LandingPageTitle>
        <S.CardContainer>
          <S.Card>
            <S.IconContainer color="#eae5ed">
              <img src={drag} alt="" width={50} height={50} />
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
              <img src={flag} alt="" width={50} height={50} />
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
              <img src={padlock} alt="" width={50} height={50} />
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
      </div>
    </div>
  );
};

export default KeyFeaturesSection;
