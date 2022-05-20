import React from "react";
import "./index.less";

const ProgressBar = ({ progress }) => {
  let bgColor = "#3cb371";
  if (progress >= 75) {
    bgColor = "#fe6f5e";
  } else if (progress >= 45) {
    bgColor = "#ffa500";
  }

  const progressBarStyle = {
    backgroundColor: `${bgColor}`,
    width: `${progress}%`,
  };

  return (
    <div className="progressBarWrapper">
      <div
        className="progressBar"
        style={progressBarStyle}
      >
        <span
          className="progressText"
        >{`${progress}%`}

        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
