import React from "react";
import { Skeleton } from "antd";
import S from "./styles";

const LoadingSkeleton = () => (
  <S.SkeletonWrapper>
    {[...Array(5).keys()].map(() => (
      <>
        <Skeleton.Input
          style={{ width: "100%", height: 40 }}
          active
        />
        <Skeleton.Input
          style={{ width: "85%", height: 35 }}
          active
        />
        <Skeleton.Input
          style={{ width: "75%", height: 25 }}
          active
        />
        <Skeleton.Input
          style={{ width: "75%", height: 25 }}
          active
        />
      </>
    ))}
  </S.SkeletonWrapper>
);

export default LoadingSkeleton;
