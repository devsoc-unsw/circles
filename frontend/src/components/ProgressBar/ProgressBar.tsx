import React from "react";
import { Progress } from "antd";

type Props = {
  progress: number
}

const ProgressBar = ({ progress }: Props) => {
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
