import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import S from './styles';

type Props = {
  text: string;
  component?: string;
};

const Spinner = ({ text, component = '' }: Props) => {
  // modify spinner css for course tab loads
  if (component === 'course-tab') {
    return (
      <S.Wrapper className="loading-spinner" style={{ gap: '1px' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: '1rem' }} spin />} />
        <p style={{ fontSize: '0.5rem' }}>{text}</p>
      </S.Wrapper>
    );
  }
  return (
    <S.Wrapper className="loading-spinner">
      <Spin indicator={<LoadingOutlined style={{ fontSize: '2.5rem' }} spin />} />
      <p>{text}</p>
    </S.Wrapper>
  );
};

export default Spinner;
