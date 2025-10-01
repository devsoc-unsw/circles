import React, { useEffect, useMemo, useState } from 'react';
import LiquidFillGauge from 'react-liquid-gauge';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { darkGrey, lightGrey, lightYellow } from 'config/constants';
import useSettings from 'hooks/useSettings';

type Props = {
  completedUOC: number;
  totalUOC: number;
};

type TextRendererProps = {
  value: number;
  width: number;
  height: number;
  textSize: number;
  percentSign: string;
};

const liquidTextRenderer = ({ value, width, height, textSize, percentSign }: TextRendererProps) => {
  const radius = Math.min(height / 2, width / 2);
  const textPixels = (textSize * radius) / 2;

  return (
    <tspan>
      <tspan className="value" style={{ fontSize: textPixels }}>
        {Math.round(value)}
      </tspan>
      <tspan style={{ fontSize: textPixels * 0.6 }}>{percentSign}</tspan>
    </tspan>
  );
};

const LiquidProgressChart: React.FC<Props> = ({ completedUOC, totalUOC }) => {
  const [percent, setPercent] = useState<number>(0);
  const fillValue = Math.min(completedUOC / totalUOC, 1);

  const { theme } = useSettings();

  const fillColor = useMemo(() => {
    if (fillValue > 0.45) {
      return theme === 'dark' ? '#663399' : '#8855cc';
    }
    return theme === 'dark' ? '#ffff66' : '#ffcc00';
  }, [fillValue, theme]);

  const textColor = useMemo(() => {
    if (theme === 'dark') return '#fff';
    if (percent < 0.31) return lightYellow;
    if (percent < 0.45) return lightGrey;
    if (percent < 0.56) return darkGrey;
    return 'white';
  }, [percent, theme]);

  const circleStyle = {
    fill: fillColor
  };

  const waveStyle = {
    fill: fillColor
  };

  const commonTextStyle = {
    fill: textColor
  };

  useEffect(() => {
    let data = 0.0;
    const interval = setInterval(() => {
      data += 0.01;
      if (fillValue && data <= fillValue + 0.01) {
        setPercent(data);
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [fillValue]);

  return (
    <>
      <div id="liquidChart">
        <div data-tip>
          <LiquidFillGauge
            width={320}
            height={320}
            value={percent * 100}
            percent="%"
            margin={0}
            textSize={0.5}
            textOffsetX={0}
            textOffsetY={15}
            outerRadius={0.91}
            textRenderer={({
              value,
              width,
              height,
              textSize,
              percent: percentSign
            }: {
              value: number;
              width: number;
              height: number;
              textSize: number;
              percent: string;
            }) => liquidTextRenderer({ value, width, height, textSize, percentSign })}
            riseAnimation
            waveAnimation
            waveFrequency={2}
            waveAmplitude={1}
            gradient={false}
            circleStyle={circleStyle}
            waveStyle={waveStyle}
            textStyle={commonTextStyle}
            waveTextStyle={commonTextStyle}
          />
        </div>
      </div>
      <ReactTooltip
        noArrow
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
