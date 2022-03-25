import React, { useEffect } from "react";
import { Skeleton } from "antd";
import "./CourseMenu.less";

export const Loading = () => {
  return (
    <div className="skelContainer">
      {[...Array(5).keys()].map(() => (
        <>
          <Skeleton.Input
            className="textLink"
            style={{ width: "100%", height: 40 }}
            active={true}
          />
          <Skeleton.Input
            className="textLink"
            style={{ width: "85%", height: 35 }}
            active={true}
          />
          <Skeleton.Input
            className="textLink"
            style={{ width: "75%", height: 25 }}
            active={true}
          />
          <Skeleton.Input
            className="textLink"
            style={{ width: "75%", height: 25 }}
            active={true}
          />
        </>
      ))}
    </div>
  );
};
