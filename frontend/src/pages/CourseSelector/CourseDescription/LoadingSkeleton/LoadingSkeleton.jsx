import React from "react";
import { Skeleton } from "antd";
import "./index.less";

const LoadingSkeleton = () => (
  <div className="loading-skeleton-container">
    <div className="loading-skeleton-description">
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
    </div>
    <div className="loading-skeleton-sidebar">
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
      <Skeleton.Input style={{ width: "100%", height: 75 }} active />
    </div>
  </div>
);

export default LoadingSkeleton;
