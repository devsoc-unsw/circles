import React from "react";
import { Skeleton } from "antd";
import { GridItem } from "../common/styles";

// TODO: Is this still being used?
const LoadingSkeleton = () => {
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
      </div>
    </div>
  );
};

export default LoadingSkeleton;
