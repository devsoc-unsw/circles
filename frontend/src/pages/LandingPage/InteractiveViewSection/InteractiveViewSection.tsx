import React from 'react';
import nodeGraphSrc from 'assets/LandingPage/nodeGraph.svg';
import viewEyeIconSrc from 'assets/LandingPage/viewEyeIcon.png';
import S from './styles';

const InteractiveViewSection = () => {
  return (
    <S.InteractiveViewContainer>
      <S.InteractiveViewTextContainer>
        <S.InteractiveViewTitle>
          <span>Interactive View</span>
          <img src={viewEyeIconSrc} alt="" width={60} height={60} />
        </S.InteractiveViewTitle>
        <S.InteractiveViewText>
          Try our interactive <strong style={{ color: '#929292' }}>Graph Selector</strong> feature
          and visualise your core and elective subjects as a node graph. Switch in-and-out between a
          table and graph view of your degree plan.
        </S.InteractiveViewText>
      </S.InteractiveViewTextContainer>
      <S.GradientBox src={nodeGraphSrc} alt="Node Graph" />
    </S.InteractiveViewContainer>
  );
};

export default InteractiveViewSection;
