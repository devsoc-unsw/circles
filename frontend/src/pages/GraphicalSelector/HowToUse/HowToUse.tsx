import React from 'react';
import { Typography } from 'antd';
import step1 from 'assets/GraphicalSelectorHelp/step1.jpg';
import step2 from 'assets/GraphicalSelectorHelp/step2.jpg';
import step3 from 'assets/GraphicalSelectorHelp/step3.jpg';
import CS from '../common/styles';
import S from './styles';

const { Title } = Typography;

const HowToUse = () => (
  <S.Wrapper>
    <S.TitleWrapper>
      <Title level={2} className="text">
        How to use the Graphical Selector
      </Title>
    </S.TitleWrapper>

    <S.ContentsWrapper>
      <div>
        <CS.TextWrapper> 1. Navigate the graph to find available courses. </CS.TextWrapper>
      </div>
      <S.ImageStep src={step1} alt="How to find a course infographic." />
      <div>
        <CS.TextWrapper> 2. Use the search bar to bring up the courses. </CS.TextWrapper>
      </div>
      <S.ImageStep src={step2} alt="How to use the search bar infographic." />
      <div>
        <CS.TextWrapper> 3. Click the course to view the course information! </CS.TextWrapper>
      </div>
      <S.ImageStep src={step3} alt="Where to click to view course information infographic." />
    </S.ContentsWrapper>
  </S.Wrapper>
);

export default HowToUse;
