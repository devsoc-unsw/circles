import React, { Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import type { LiquidConfig } from '@ant-design/plots';
import {
  darkGrey,
  lightGrey,
  lightYellow,
  purple,
  yellow,
} from 'config/constants';
import type { RootState } from 'config/store';

type Props = {
  completedUOC: number
  totalUOC: number
};

const Liquid = React.lazy(() => import('@ant-design/plots').then((plot) => ({ default: plot.Liquid })));

const LiquidProgressChart = ({ completedUOC, totalUOC }: Props) => {
  const [percent, setPercent] = useState(0);
  const fillValue = completedUOC / totalUOC;

  // light mode text color varies
  let textColor = '';
  if (percent < 0.31) {
    textColor = lightYellow;
  } else if (percent < 0.45) {
    textColor = lightGrey;
  } else if (percent < 0.56) {
    textColor = darkGrey;
  } else {
    textColor = 'white';
  }

  // dark mode always has white text
  const { theme } = useSelector((state: RootState) => state.settings);
  if (theme === 'dark') {
    textColor = 'white';
  }

  const config: LiquidConfig = {
    percent,
    radius: 1,
    width: 320,
    height: 320,
    autoFit: false,
    statistic: {
      title: {
        formatter: () => 'Progress',
        style: () => ({
          fill: textColor,
        }),
      },
      content: {
        style: {
          fontSize: '60px',
          lineHeight: 1,
          fill: textColor,
        },
        formatter: () => `${(percent * 100).toFixed(0)}%`,
      },
    },
    liquidStyle: () => ({
      fill: percent > 0.45 ? purple : yellow,
      stroke: percent > 0.45 ? purple : yellow,
    }),
  };
  // increment percentage from 0 to fillValue
  useEffect(() => {
    let data = 0.0;
    const time = 30;
    const interval = setInterval(() => {
      data += 0.01;
      if (fillValue && data <= fillValue + 0.01) {
        setPercent(data);
      } else {
        clearInterval(interval);
      }
    }, time);
  }, [fillValue]);

  return (
    <div>
      <ReactTooltip place="bottom" type={theme === 'dark' ? 'light' : 'dark'}>
        {completedUOC} / {totalUOC} UOC
      </ReactTooltip>
      <div data-tip>
        <Suspense fallback={<div>Loading...</div>}>
          <Liquid {...config} />
        </Suspense>
      </div>
    </div>
  );
};

export default LiquidProgressChart;
