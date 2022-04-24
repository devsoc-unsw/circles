import React from "react";
import { Skeleton } from "antd";
import SkeletonCard from "./SkeletonCard";

const SkeletonDashboard = () => (
  <div className="centered">
    <Skeleton.Avatar style={{ width: 320, height: 320 }} active />
    <Skeleton.Input
      className="textLink"
      style={{ width: 400, height: 40 }}
      active
    />
    <div className="cards">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

export default SkeletonDashboard;
