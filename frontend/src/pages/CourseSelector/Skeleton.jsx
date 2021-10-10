import React from "react";
import { Skeleton } from "antd";

const SkeletonCourse = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '65vw' }}>
      {/* title */}
      <Skeleton.Input
        className="textLink"
        style={{ width: '60%', height: 80 }}
        active={true}
      />
      {/* overview */}
      <Skeleton.Input
        className="textLink"
        style={{ width: '20%', height: 30 }}
        active={true}
      />
      {/* description */}
      <Skeleton.Input
        className="textLink"
        style={{ width: '80%', height: 250 }}
        active={true}
      />
      {/* prereq */}
      <Skeleton.Input
        className="textLink"
        style={{ width: '80%', height: 100 }}
        active={true}
      />
    </div>
  );
};

export default SkeletonCourse;
