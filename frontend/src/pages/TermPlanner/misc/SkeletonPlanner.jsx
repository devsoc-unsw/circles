import React from "react";
import { Skeleton } from "antd";

function SkeletonPlanner() {
  const skeletonTermStyle = {
    width: "20em",
    height: "18em",
    margin: "1em",
    padding: "1.2em",
    borderRadius: "2em",
  };

  return (
    <div className="plannerContainer">
      <div className="gridContainer">
        <div className="gridItem" />
        <div className="gridItem">Term 1</div>
        <div className="gridItem">Term 2</div>
        <div className="gridItem">Term 3</div>

        <div className="gridItem" />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />

        <div className="gridItem" />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />

        <div className="gridItem" />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
        <Skeleton.Button
          active={true}
          shape="round"
          style={skeletonTermStyle}
        />
      </div>
    </div>
  );
}

export default SkeletonPlanner;
