import React from 'react';
import circlesLogo from 'assets/circlesWithBg.svg';
import S from './styles';

const PageFallback = () => (
  <S.PageWrapper>
    <S.LoadingLogo src={circlesLogo} alt="Circles Logo" />
  </S.PageWrapper>
);

export default PageFallback;
