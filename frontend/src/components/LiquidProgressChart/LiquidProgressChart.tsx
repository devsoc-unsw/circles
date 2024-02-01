import React, { Suspense, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import type { LiquidConfig } from '@ant-design/plots';
import Spinner from 'components/Spinner';
import { darkGrey, lightGrey, lightYellow, purple, yellow } from 'config/constants';
import type { RootState } from 'config/store';

type Props = {
  completedUOC: number;
  totalUOC: number;
};

const Liquid = React.lazy(() =>
  import('@ant-design/plots').then((plot) => ({ default: plot.Liquid }))
);

const LiquidProgressChart = ({ completedUOC, totalUOC }: Props) => {
  const [percent, setPercent] = useState(0);
  const fillValue = Math.min(completedUOC / totalUOC, 1);

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
    width: 320,
    height: 320,
    autoFit: false,
    style: {
      title: {
        formatter: () => 'Progress',
        style: () => ({
          fill: textColor
        })
      },
      content: {
        style: {
          fontSize: '60px',
          lineHeight: 1,
          fill: textColor
        },
        formatter: () => `${(percent * 100).toFixed(0)}%`
      },
      liquid: () => ({
        fill: percent > 0.45 ? purple : yellow,
        stroke: percent > 0.45 ? purple : yellow
      })
    }
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
    <>
      <div id="liquidChart">
        <div data-tip>
          <Suspense fallback={<Spinner text="Loading Progress..." />}>
            <Liquid {...config} />
          </Suspense>
        </div>
      </div>
      <ReactTooltip
        anchorSelect="#liquidChart"
        place="bottom"
        variant={theme === 'dark' ? 'light' : 'dark'}
      >
        {completedUOC} / {totalUOC} UOC
      </ReactTooltip>
    </>
  );
};

export default LiquidProgressChart;
