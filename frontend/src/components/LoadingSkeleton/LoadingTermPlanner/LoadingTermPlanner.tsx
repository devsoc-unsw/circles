import React from 'react';
import Skeleton from 'antd/lib/skeleton';
import { GridItem } from 'pages/TermPlanner/common/styles';
import CS from 'pages/TermPlanner/styles';

const LoadingTermPlanner = () => {
  const skeletonTermStyle = {
    width: '20em',
    height: '18em',
    margin: '1em',
    padding: '1.2em',
    borderRadius: '2em',
  };

  return (
    <CS.PlannerContainer>
      <CS.PlannerGridWrapper>
        <GridItem />
        <GridItem>Term 1</GridItem>
        <GridItem>Term 2</GridItem>
        <GridItem>Term 3</GridItem>

        <GridItem />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />

        <GridItem />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />

        <GridItem />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active
          shape="round"
          style={skeletonTermStyle}
        />
      </CS.PlannerGridWrapper>
    </CS.PlannerContainer>
  );
};

export default LoadingTermPlanner;
