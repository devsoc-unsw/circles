/* eslint-disable */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography } from 'antd';
import { fetchAllDegrees } from 'utils/api/programApi';
import { getUserDegree } from 'utils/api/userApi';
import CourseSearchBar from 'components/CourseSearchBar';
import { useAppDispatch } from 'hooks';
import { addTab } from 'reducers/courseTabsSlice';
import S from './styles';
import { CoursesResponse, PlannerResponse } from 'types/userResponse';

const { Title } = Typography;

type CourseBannerProps = {
  planner?: PlannerResponse;
  courses?: CoursesResponse;
};

const CourseBanner = ({ planner, courses }: CourseBannerProps) => {
  const dispatch = useAppDispatch();

  const degreeQuery = useQuery({
    queryKey: ['degree'],
    queryFn: getUserDegree
  });
  const allPrograms = useQuery({
    queryKey: ['programs'],
    queryFn: fetchAllDegrees
  });

  const getUserProgramTitle = (): string => {
    if (degreeQuery.data?.programCode) {
      return allPrograms.data?.programs[degreeQuery.data?.programCode] || '';
    }
    return '';
  };

  return (
    <S.BannerWrapper>
      <Title level={2} className="text">
        {degreeQuery.data?.programCode} - {getUserProgramTitle()}
      </Title>
      <CourseSearchBar
        onSelectCallback={(courseCode) => dispatch(addTab(courseCode))}
        planner={planner}
        userCourses={courses}
      />
    </S.BannerWrapper>
  );
};

export default CourseBanner;
