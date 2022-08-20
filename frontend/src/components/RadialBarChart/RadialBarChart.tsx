import React, { Suspense } from 'react';
import type { RadialBarConfig } from '@ant-design/plots';
import Spinner from 'components/Spinner';
import data from './radialChartData';

const RadialBar = React.lazy(() => import('@ant-design/plots').then((plot) => ({ default: plot.RadialBar })));

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
      // formatter: (datum) => ({ name: datum.name, value: datum.UOC }),
    },
    colorField: 'color', // or seriesField in some cases
    // color: ({ color }) => color,
    barBackground: {},
    barStyle: { lineCap: 'round' },
  };
  return (
    <Suspense fallback={<Spinner text="Loading bar..." />}>
      <RadialBar {...config} />
    </Suspense>
  );
};

export default RadialBarChart;
