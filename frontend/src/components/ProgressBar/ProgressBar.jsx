import React from "react";
import "./index.less";
import { Progress } from "antd";

const ProgressBar = ({ progress }) => {
  let bgColor = "#3cb371";
  if (progress >= 75) {
    bgColor = "#fe6f5e";
  } else if (progress >= 45) {
    bgColor = "#ffa500";
  }

  return (
    <Progress
      strokeColor={bgColor}
      percent={progress}
    />
  );
};
export default ProgressBar;
