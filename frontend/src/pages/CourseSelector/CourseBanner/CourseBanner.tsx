import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Typography from 'antd/lib/typography';
import CourseSearchBar from 'components/CourseSearchBar';
import type { RootState } from 'config/store';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';

const { Title } = Typography;

const CourseBanner = () => {
  const {
    programCode, programName,
  } = useSelector((state: RootState) => state.degree);

  const dispatch = useDispatch();

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">{programCode} - {programName}</Title>
      <CourseSearchBar onSelectCallback={(courseCode) => dispatch(addTab(courseCode))} />
    </S.BannerWrapper>
  );
};

export default CourseBanner;
