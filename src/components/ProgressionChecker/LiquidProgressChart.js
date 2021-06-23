import React, { useState, useEffect } from "react";
import { Liquid, measureTextWidth } from "@ant-design/charts";
import ReactTooltip from "react-tooltip";
import { useSelector } from "react-redux";

function LiquidProgressChart({ completedUOC, totalUOC }) {
  var [percent, setPercent] = useState(0);
  var ref;
  var fillValue = completedUOC / totalUOC;
  var color;

  if (percent < 0.31) {
    color = "#f9b01e"; // yellow
  } else if (percent < 0.45) {
    color = "#565652"; // light grey
  } else if (percent < 0.56) {
    color = "#323739"; // dark grey
  } else {
    color = "white"; // white
  }

  const theme = useSelector((state) => state.theme);
  if (theme === "dark") {
    color = "white";
  }

  var config = {
    percent,
    radius: 1,
    width: 320,
    height: 320,
    autoFit: false,
    statistic: {
      title: {
        formatter: function formatter(_ref1) {
          var percent = _ref1.percent;
          return "Progress";
        },
        style: function style(_ref) {
          return {
            fill: color,
            //      percent < 0.55 ? "#323739" : "white",
            //       percent < 0.31 ? "#f9b01e" : percent < 0.53 ? "#595959" : "white",
          };
        },
      },
      content: {
        style: function style(_ref2) {
          var percent = _ref2.percent;
          return {
            fontSize: 60,
            lineHeight: 1,
            fill: color,
            //     percent < 0.55 ? "#323739" : "white",
            //       percent < 0.31 ? "#f9b01e" : percent < 0.53 ? "#595959" : "white",
          };
        },

        customHtml: function customHtml(container, view, _ref3) {
          var percent = _ref3.percent;
          var _container$getBoundin = container.getBoundingClientRect(),
            width = _container$getBoundin.width,
            height = _container$getBoundin.height;
          var d = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
          var text = (percent * 100).toFixed(0) + "%";
          var textWidth = (0, measureTextWidth)(text, { fontSize: 60 });
          var scale = Math.min(d / textWidth, 1);
          return '<div style="width:'
            .concat(
              d,
              "px;display:flex;align-items:center;justify-content:center;font-size:"
            )
            .concat(scale, "em;line-height:")
            .concat(scale <= 1 ? 1 : "inherit", '">')
            .concat(text, "</div>");
        },
      },
    },
    liquidStyle: function liquidStyle(_ref4) {
      var percent = _ref4.percent;
      return {
        fill: percent > 0.45 ? "#9254de" : "#FAAD14",
        stroke: percent > 0.45 ? "#9254de" : "#FAAD14",
      };
    },
    color: function color() {
      return "#9254de";
    },
  };
  useEffect(() => {
    var data = 0.0;
    let time = 30;
    time += 5;
    var interval = setInterval(function () {
      data += 0.01;

      if (data <= fillValue) {
        setPercent(data);
      } else {
        clearInterval(interval);
      }
    }, time);
  }, []);
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
