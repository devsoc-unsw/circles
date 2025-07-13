declare module 'react-liquid-gauge' {
  import * as React from 'react';

  export interface LiquidFillGaugeProps {
    // can add the extra properties but didnt need them, linked for reference
    // https://github.com/trendmicro-frontend/react-liquid-gauge?tab=readme-ov-file#api
    width?: number;
    height?: number;
    value?: number;
    percent?: string;
    margin?: number;
    textSize?: number;
    textOffsetX?: number;
    textOffsetY?: number;
    outerRadius?: number;
    textRenderer?: (props: {
      value: number;
      width: number;
      height: number;
      textSize: number;
      percent: string;
    }) => React.ReactNode;
    riseAnimation?: boolean;
    waveAnimation?: boolean;
    waveFrequency?: number;
    waveAmplitude?: number;
    gradient?: boolean;
    circleStyle?: React.CSSProperties;
    waveStyle?: React.CSSProperties;
    textStyle?: React.CSSProperties;
    waveTextStyle?: React.CSSProperties;
  }

  const LiquidFillGauge: React.FC<LiquidFillGaugeProps>;
  export default LiquidFillGauge;
}
