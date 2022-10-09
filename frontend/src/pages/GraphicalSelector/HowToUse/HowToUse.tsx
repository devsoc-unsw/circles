import React, { FunctionComponent } from 'react';
import { Typography } from 'antd';
import step1 from 'assets/graphicalSelector/step1.jpg';
import step2 from 'assets/graphicalSelector/step2.jpg';
import step3 from 'assets/graphicalSelector/step3.jpg';
import S from './styles';

const { Title, Text } = Typography;

const HowToUse: FunctionComponent = () => (
  <S.Wrapper>
    <S.TitleWrapper>
      <Title level={2} className="text">
        How to use the Graphical Selector
      </Title>
    </S.TitleWrapper>

    <S.ContentsWrapper>
      <div>
        <Text>1. Navigate the graph to find available courses.</Text>
      </div>
      <S.ImageStep src={step1} alt="helloooo" />
      <div>
        <Text>2. Use the search bar to bring up the courses.</Text>
      </div>
      <S.ImageStep src={step2} alt="helloooo" />
      <div>
        <Text>3. Click the course to view the course information!</Text>
      </div>
      <S.ImageStep src={step3} alt="helloooo" />
    </S.ContentsWrapper>
  </S.Wrapper>
);

export default HowToUse;
