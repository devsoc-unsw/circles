import React, { useState, useEffect } from "react";
import { Liquid, measureTextWidth } from "@ant-design/charts";
import ReactTooltip from "react-tooltip";
import { useSelector } from "react-redux";

function LiquidProgressChart({ completedUOC, totalUOC }) {
  var [percent, setPercent] = useState(0);
  var ref;
  var fillValue = completedUOC / totalUOC;

  var textColor;
  // light mode
  if (percent < 0.31) {
    textColor = "#f9b01e"; // yellow
  } else if (percent < 0.45) {
    textColor = "#565652"; // light grey
  } else if (percent < 0.56) {
    textColor = "#323739"; // dark grey
  } else {
    textColor = "white"; // white
  }

  // dark mode has consistent white text
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
    percent,
    radius: 1,
    width: 320,
    height: 320,
    autoFit: false,
    statistic: {
      title: {
        formatter: function formatter() {
          return "Progress";
        },
        style: function style() {
          return {
            fill: textColor,
          };
        },
      },
      content: {
        style: function style() {
          return {
            fontSize: 60,
            lineHeight: 1,
            fill: textColor,
          };
        },
        formatter: function formatter() {
          return (percent * 100).toFixed(0) + "%";
        },
      },
    },
    liquidStyle: function liquidStyle() {
      return {
        fill: percent > 0.45 ? "#9254de" : "#FAAD14",
        stroke: percent > 0.45 ? "#9254de" : "#FAAD14",
      };
    },
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
}

export default LiquidProgressChart;
