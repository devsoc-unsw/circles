import React from "react";
import { Skeleton } from "antd";
import SkeletonCard from "./SkeletonCard";

const SkeletonDashboard = () => {
  return (
    <div className="centered">
      <Skeleton.Avatar style={{ width: 320, height: 320 }} active={true} />
      <Skeleton.Input
        className="textLink"
        style={{ width: 400, height: 40 }}
        active={true}
      />
      <div className="cards">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};

export default SkeletonDashboard;
