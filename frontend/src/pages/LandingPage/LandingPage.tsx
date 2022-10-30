/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import drag from './Assets/img/drag-and-drop.png';
import flag from './Assets/img/flag.png';
import padlock from './Assets/img/open-padlock.png';
import view from './Assets/img/view.png';
import S from './styles';

const LandingPage = () => (
  <S.LandingPageContainer>
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
          <S.iconContainer color="#eae5ed">
            <img src={drag} alt="" width={50} height={50} />
          </S.iconContainer>
          <S.LandingPageSubtitle startColor="#cabade" endColor="#9e88ba">
            Drag N' Drop
          </S.LandingPageSubtitle>
          <S.divider color="#c3b3c9" />
          <S.content>
            Drag and drop functionality to make planning an intuitive and easy process
          </S.content>
        </S.Card>
        <S.Card>
          <S.iconContainer color="#eddafc">
            <img src={flag} alt="" width={50} height={50} />
          </S.iconContainer>
          <S.LandingPageSubtitle startColor="#9b5dea" endColor="#dbe2fc">
            Track progress
          </S.LandingPageSubtitle>
          <S.divider color="#f2ccff" />
          <S.content>
            Plan ahead with our progression tracker, and track how far you've gone in your degree
          </S.content>
        </S.Card>
        <S.Card>
          <S.iconContainer color="#d4ffdc">
            <img src={padlock} alt="" width={50} height={50} />
          </S.iconContainer>
          <S.LandingPageSubtitle startColor="#9fecae" endColor="#93d392">
            Prereq Validation
          </S.LandingPageSubtitle>
          <S.divider color="#a3ebb1" />
          <S.content>
            Verify you meet all the pre-requisites required to take any given course
          </S.content>
        </S.Card>
      </S.CardContainer>
    </div>
    <S.InteractiveViewContainer>
      <S.InteractiveViewTextContainer>
        <S.InteractiveViewTitle>
          Interactive View&nbsp;&nbsp;
          <img src={view} alt="" width={60} height={60} />
        </S.InteractiveViewTitle>
        <S.InteractiveViewText>
          Try our interactive <strong style={{ color: '#929292' }}>Graph Selector</strong> feature
          and visualise your core and elective subjects as a node graph. Switch in-and-out between a
          table and graph view of your degree plan.
        </S.InteractiveViewText>
      </S.InteractiveViewTextContainer>
      <S.gradientBox>
        <p>Insert graph</p>
      </S.gradientBox>
    </S.InteractiveViewContainer>
    <br />
  </S.LandingPageContainer>
);

export default LandingPage;
