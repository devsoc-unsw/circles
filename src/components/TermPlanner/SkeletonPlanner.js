import React from "react";
import { Skeleton } from "antd";

function SkeletonPlanner() {
  const skeletonTermStyle = {
    //     height: "20em",
    //     width: "85%",
    width: "25.5em",
    height: "22em",
    margin: "1em",
    padding: "1.2em",
    borderRadius: "4em",
  };

  return (
    <div className="gridContainer">
      <div className="gridItem"></div>
      <div className="gridItem">Term 1</div>
      <div className="gridItem">Term 2</div>
      <div className="gridItem">Term 3</div>

      <div className="gridItem">2021</div>
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />

      <div className="gridItem">2021</div>
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />

      <div className="gridItem">2021</div>
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      <Skeleton.Button active={true} shape="round" style={skeletonTermStyle} />
      {/* <Skeleton.Button style={skeletonTermStyle} className="termBox" /> */}
    </div>
  );
}

export default SkeletonPlanner;
