import React from "react";
import { RadialBar } from "@ant-design/charts";
import { data } from "./radialChartData";

// not currently used
const RadialBarChart = () => {
  var config = {
    data: data,
    xField: "name",
    yField: "UOC",
    maxAngle: 720,
    width: 320,
    height: 320,
    innerRadius: 0.3,
    tooltip: {
      formatter: function formatter(datum) {
        return {
          name: "UOC",
          value: datum.UOC,
        };
      },
    },
    colorField: "color", // or seriesField in some cases
    color: ({ color }) => {
      return color;
    },
    barBackground: {},
    barStyle: { lineCap: "round" },
  };
  return <RadialBar {...config} />;
};

export default RadialBarChart;
