import React from 'react';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import step1Dark from 'assets/GraphicalSelectorHelp/step1-dark.jpg';
import step1Light from 'assets/GraphicalSelectorHelp/step1-light.jpg';
import step2Dark from 'assets/GraphicalSelectorHelp/step2-dark.jpg';
import step2Light from 'assets/GraphicalSelectorHelp/step2-light.jpg';
import step3Dark from 'assets/GraphicalSelectorHelp/step3-dark.jpg';
import step3Light from 'assets/GraphicalSelectorHelp/step3-light.jpg';
import step4Dark from 'assets/GraphicalSelectorHelp/step4-dark.jpg';
import step4Light from 'assets/GraphicalSelectorHelp/step4-light.jpg';
import type { RootState } from 'config/store';
import CS from '../common/styles';
import S from './styles';

const { Title } = Typography;

const HowToUse = () => {
  const { theme } = useSelector((state: RootState) => state.settings);

  const step = (num: number) => {
    let url = '';
    if (num === 1) url = theme === 'light' ? step1Light : step1Dark;
    if (num === 2) url = theme === 'light' ? step2Light : step2Dark;
    if (num === 3) url = theme === 'light' ? step3Light : step3Dark;
    if (num === 4) url = theme === 'light' ? step4Light : step4Dark;
    return url;
  };

  return (
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
        <S.ImageStep src={step(1)} alt="How to find a course infographic." />
        <div>
          <CS.TextWrapper> 2. Use the search bar to bring up the courses. </CS.TextWrapper>
        </div>
        <S.ImageStep src={step(2)} alt="How to use the search bar infographic." />
        <div>
          <CS.TextWrapper> 3. Hover over a course to see related courses. </CS.TextWrapper>
        </div>
        <S.ImageStep src={step(3)} alt="How to quickly view related courses." />
        <div>
          <CS.TextWrapper> 4. Click the course to view the course information! </CS.TextWrapper>
        </div>
        <S.ImageStep src={step(4)} alt="Where to click to view course information infographic." />
      </S.ContentsWrapper>
    </S.Wrapper>
  );
};

export default HowToUse;
