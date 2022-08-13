import React from 'react';
import { Skeleton } from 'antd';
import LoadingDegreeCard from './LoadingDegreeCard';
import S from './styles';

const LoadingDashboard = () => (
  <S.DashboardWrapper>
    <Skeleton.Avatar style={{ width: 320, height: 320 }} active />
    <Skeleton.Input
      style={{ width: 400, height: 40 }}
      active
    />
    <S.CardsWrapper>
      <LoadingDegreeCard />
      <LoadingDegreeCard />
    </S.CardsWrapper>
  </S.DashboardWrapper>
);

export default LoadingDashboard;
