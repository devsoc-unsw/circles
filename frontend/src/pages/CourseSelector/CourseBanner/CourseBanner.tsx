import React from 'react';
import { Typography } from 'antd';
import CourseSearchBar from 'components/CourseSearchBar';
import type { RootState } from 'config/store';
import { useAppDispatch, useAppSelector } from 'hooks';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';

const { Title } = Typography;

const CourseBanner = () => {
  const { programCode, programName } = useAppSelector((state: RootState) => state.degree);
  const dispatch = useAppDispatch();

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">
        {programCode} - {programName}
      </Title>
      <CourseSearchBar onSelectCallback={(courseCode) => dispatch(addTab(courseCode))} />
    </S.BannerWrapper>
  );
};

export default CourseBanner;
