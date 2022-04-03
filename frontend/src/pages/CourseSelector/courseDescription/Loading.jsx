import React from "react";
import { Skeleton } from "antd";
import "./courseDescription.less";

export const Loading = () => {
  return (
    <div className="skelDescContainer">
      <div className="skelDescInfo">
        {/* title */}
        <Skeleton.Input style={{ width: "70%", height: 70 }} active={true} />
        {/* overview */}
        <Skeleton.Input style={{ width: "25%", height: 40 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 200 }} active={true} />
        {/* description */}
        <Skeleton.Input style={{ width: "25%", height: 40 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 100 }} active={true} />
        {/* prereq */}
        <Skeleton.Input style={{ width: "25%", height: 40 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 100 }} active={true} />
        {/* unlocks */}
        <Skeleton.Input style={{ width: "25%", height: 40 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 100 }} active={true} />
      </div>
      <div className="skelDescSidebar">
        <Skeleton.Input style={{ width: "100%", height: 75 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 75 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 75 }} active={true} />
        <Skeleton.Input style={{ width: "100%", height: 75 }} active={true} />
      </div>
    </div>
  );
};
