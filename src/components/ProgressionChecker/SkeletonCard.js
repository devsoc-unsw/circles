import React from "react";
import { Skeleton } from "antd";

const SkeletonCard = () => {
  return (
    <Skeleton.Button
      className="skeletonCard"
      style={{ width: "20em", height: "8.5em" }}
      active={true}
      round
    />
  );
};

export default SkeletonCard;
