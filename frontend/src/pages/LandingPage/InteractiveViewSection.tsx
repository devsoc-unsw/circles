import React from 'react';
// import nodeGraph from '../../assets/LandingPage/nodeGraph.svg';
import view from '../../assets/LandingPage/InteractiveView/view.png';
import S from './styles';

const InteractiveViewSection = () => {
  return (
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
      <S.GradientBox>
        <img src="src/assets/LandingPage/InteractiveView/nodeGraph.svg" alt="Node Graph" />
      </S.GradientBox>
    </S.InteractiveViewContainer>
  );
};

export default InteractiveViewSection;
