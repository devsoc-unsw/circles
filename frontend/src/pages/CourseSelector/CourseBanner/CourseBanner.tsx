import React from 'react';
import { useQuery } from 'react-query';
import { Typography } from 'antd';
import { fetchAllDegrees } from 'utils/api/programApi';
import { getUserDegree } from 'utils/api/userApi';
import CourseSearchBar from 'components/CourseSearchBar';
import { useAppDispatch } from 'hooks';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';

const { Title } = Typography;

const CourseBanner = () => {
  const dispatch = useAppDispatch();

  const degreeQuery = useQuery('degree', getUserDegree);
  const allProgams = useQuery('programs', fetchAllDegrees);

  const getUserProgram = (): string => {
    console.log(allProgams);
    if (degreeQuery.data?.programCode) {
      return allProgams.data?.programs[degreeQuery.data?.programCode] || '';
    }
    return '';
  };

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">
        {degreeQuery.data?.programCode} - {getUserProgram()}
      </Title>
      <CourseSearchBar onSelectCallback={(courseCode) => dispatch(addTab(courseCode))} />
    </S.BannerWrapper>
  );
};

export default CourseBanner;
