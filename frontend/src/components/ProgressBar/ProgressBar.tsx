import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from 'config/store';
import S from './styles';

type Props = {
  progress: number;
};

const ProgressBar = ({ progress }: Props) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const trailColor = theme === 'light' ? '#f5f5f5' : '#444249';

  let bgColor = '#3cb371';
  if (progress >= 75) {
    bgColor = '#fe6f5e';
  } else if (progress >= 45) {
    bgColor = '#ffa500';
  }

  return <S.Progress strokeColor={bgColor} percent={progress} trailColor={trailColor} />;
};
export default ProgressBar;
