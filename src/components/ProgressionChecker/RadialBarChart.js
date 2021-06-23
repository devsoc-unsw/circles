import React from "react";
import { RadialBar } from "@ant-design/charts";

function RadialBarChart() {
  var data = [
    {
      name: "G6",
      UOC: 10,
      color: "#b37feb",
    },
    {
      name: "Specialisation",
      UOC: 20,
      color: "#9254de",
    },
    {
      name: "Total",
      UOC: 15,
      color: "#722ed1",
    },
  ];
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
}

export default RadialBarChart;
