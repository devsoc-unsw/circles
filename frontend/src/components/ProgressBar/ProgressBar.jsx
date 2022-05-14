import React from "react";
import "./progressBar.less";

const ProgressBar = ({ progress, height }) => {
  let bgColor = "#3cb371";
  if (progress >= 45) {
    bgColor = "#ffa500";
  } else if (progress >= 75) {
    (bgColor = "#fe6f5e");
  }

  return (
    <div className="progressBarWrapper" height={height}>
      <div className="progressBar" width={progress}>
        <span
          className="progressText"
          backgroundColor={bgColor}
        >{`${progress}%`}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
