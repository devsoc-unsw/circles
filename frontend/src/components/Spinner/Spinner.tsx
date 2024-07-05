import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import S from './styles';

type Props = {
  text: string;
  size?: string;
};

const Spinner = ({ text, size = 'large' }: Props) => {
  // Small Spinner
  if (size === 'small') {
    return (
      <S.SmallWrapper className="loading-spinner">
        <Spin indicator={<LoadingOutlined spin />} size="small" />
        <p>{text}</p>
      </S.SmallWrapper>
    );
  }
  // Large Spinner (Default)
  if (size === 'large') {
    return (
      <S.LargeWrapper className="loading-spinner">
        <Spin indicator={<LoadingOutlined spin />} size="large" />
        <p>{text}</p>
      </S.LargeWrapper>
    );
  }

  return null;
};

export default Spinner;
