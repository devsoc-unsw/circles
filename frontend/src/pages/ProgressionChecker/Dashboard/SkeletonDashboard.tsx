import React from 'react';
import { Skeleton } from 'antd';
import { SkeletonCard } from '../DegreeCard';
import S from './styles';

const SkeletonDashboard = () => (
  <S.ContentWrapper>
    <Skeleton.Avatar style={{ width: 320, height: 320 }} active />
    <Skeleton.Input
      style={{ width: 400, height: 40 }}
      active
    />
    <S.CardsWrapper>
      <SkeletonCard />
      <SkeletonCard />
    </S.CardsWrapper>
  </S.ContentWrapper>
);

export default SkeletonDashboard;
