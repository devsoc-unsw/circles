/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

// TODO: fix typescript eslint here

import React from 'react';
import type { RadialBarConfig } from '@ant-design/charts';
import { RadialBar } from '@ant-design/charts';
import data from './radialChartData';

const RadialBarChart = () => {
  const config: RadialBarConfig = {
    data,
    xField: 'name',
    yField: 'UOC',
    maxAngle: 720,
    width: 320,
    height: 320,
    innerRadius: 0.3,
    tooltip: {
      formatter: function formatter(datum) {
        return {
          name: 'UOC',
          value: datum.UOC,
        };
      },
    },
    colorField: 'color', // or seriesField in some cases
    color: ({ color }) => color,
    barBackground: {},
    barStyle: { lineCap: 'round' },
  };
  return <RadialBar {...config} />;
};

export default RadialBarChart;
