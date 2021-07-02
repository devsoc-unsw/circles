import React, { useState, useEffect } from "react";
import { Liquid } from "@ant-design/charts";
import ReactTooltip from "react-tooltip";
import { useSelector } from "react-redux";
import {
  purple,
  yellow,
  lightYellow,
  lightGrey,
  darkGrey,
} from "./ChartColors";

const LiquidProgressChart = ({ completedUOC, totalUOC }) => {
  var [percent, setPercent] = useState(0);
  var fillValue = completedUOC / totalUOC;
  var ref;

  // light mode text color varies
  var textColor;
  if (percent < 0.31) {
    textColor = lightYellow;
  } else if (percent < 0.45) {
    textColor = lightGrey;
  } else if (percent < 0.56) {
    textColor = darkGrey;
  } else {
    textColor = "white";
  }

  // dark mode always has white text
  const theme = useSelector((state) => state.theme);
  if (theme === "dark") {
    textColor = "white";
  }

  // increment percentage from 0 to fillValue
  useEffect(() => {
    var data = 0.0;
    const time = 30;
    var interval = setInterval(function () {
      data += 0.01;
      if (data <= fillValue + 0.01) {
        setPercent(data);
      } else {
        clearInterval(interval);
      }
    }, time);
  }, []);

  var config = {
    percent: percent,
    radius: 1,
    width: 320,
    height: 320,
    autoFit: false,
    statistic: {
      title: {
        formatter: () => "Progress",
        style: () => ({
          fill: textColor,
        }),
      },
      content: {
        style: () => ({
          fontSize: 60,
          lineHeight: 1,
          fill: textColor,
        }),
        formatter: () => (percent * 100).toFixed(0) + "%",
      },
    },
    liquidStyle: () => ({
      fill: percent > 0.45 ? purple : yellow,
      stroke: percent > 0.45 ? purple : yellow,
    }),
  };

  return (
    <div>
      <ReactTooltip place="bottom">
        {completedUOC}/{totalUOC} UOC
      </ReactTooltip>
      <div data-tip>
        <Liquid {...config} chartRef={(chartRef) => (ref = chartRef)} />
      </div>
    </div>
  );
};

export default LiquidProgressChart;
