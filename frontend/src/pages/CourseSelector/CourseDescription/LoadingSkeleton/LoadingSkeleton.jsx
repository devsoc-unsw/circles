import React from "react";
import { Skeleton } from "antd";
import S from "./styles";

const LoadingSkeleton = () => (
  <S.SkeletonWrapper>
    <S.SkeletonDescription>
      {/* title */}
      <Skeleton.Input style={{ width: "70%", height: 70 }} active />
      {/* overview */}
      <Skeleton.Input style={{ width: "25%", height: 40 }} active />
      <Skeleton.Input style={{ width: "100%", height: 200 }} active />
      {/* description */}
      <Skeleton.Input style={{ width: "25%", height: 40 }} active />
      <Skeleton.Input style={{ width: "100%", height: 100 }} active />
      {/* prereq */}
      <Skeleton.Input style={{ width: "25%", height: 40 }} active />
      <Skeleton.Input style={{ width: "100%", height: 100 }} active />
      {/* unlocks */}
      <Skeleton.Input style={{ width: "25%", height: 40 }} active />
      <Skeleton.Input style={{ width: "100%", height: 100 }} active />
    </S.SkeletonDescription>
    <S.SkeletonAttributes>
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
    </S.SkeletonAttributes>
  </S.SkeletonWrapper>
);

export default LoadingSkeleton;
