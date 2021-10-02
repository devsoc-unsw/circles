import React from "react";
import { Skeleton } from "antd";

export const Loading = () => {
  return (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        width: '18vw', 
        padding: "1.6rem 2rem"   
    }}>
      <Skeleton.Input
        className="textLink"
        style={{ width: '100%', height: 40 }}
        active={true}
      />
      <Skeleton.Input
        className="textLink"
        style={{ width: '75%', height: 20 }}
        active={true}
      />
      <Skeleton.Input
        className="textLink"
        style={{ width: '85%', height: 20 }}
        active={true}
      />
      <Skeleton.Input
        className="textLink"
        style={{ width: '65%', height: 20 }}
        active={true}
      />
    </div>
  );
};
