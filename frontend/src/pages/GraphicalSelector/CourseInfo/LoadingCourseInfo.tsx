import React from 'react';
import { Skeleton } from 'antd';
import styled from 'styled-components';

const SkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  gap: 20px;
`;

const LoadingCourseInfo = () => (
  <SkeletonWrapper>
    {/* title */}
    <Skeleton.Input style={{ width: '70%', height: 70 }} active />
    {/* overview */}
    <Skeleton.Input style={{ width: '25%', height: 40 }} active />
    <Skeleton.Input style={{ width: '100%', height: 200 }} active />
    {/* description */}
    <Skeleton.Input style={{ width: '25%', height: 40 }} active />
    <Skeleton.Input style={{ width: '100%', height: 40 }} active />
    {/* prereq */}
    <Skeleton.Input style={{ width: '25%', height: 40 }} active />
    <Skeleton.Input style={{ width: '100%', height: 40 }} active />
    {/* unlocks */}
    <Skeleton.Input style={{ width: '25%', height: 40 }} active />
    <Skeleton.Input style={{ width: '100%', height: 40 }} active />
  </SkeletonWrapper>
);

export default LoadingCourseInfo;
