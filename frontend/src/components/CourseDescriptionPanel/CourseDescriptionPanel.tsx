import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Typography } from 'antd';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import { getCourseInfo, getCoursePrereqs, getCoursesUnlockedWhenTaken } from 'utils/api/coursesApi';
import { getCourseTimetable } from 'utils/api/timetableApi';
import getEnrolmentCapacity from 'utils/getEnrolmentCapacity';
import { unwrapSettledPromise } from 'utils/queryUtils';
import {
  LoadingCourseDescriptionPanel,
  LoadingCourseDescriptionPanelSidebar
} from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import CourseAttributes from './CourseAttributes';
import CourseInfoDrawers from './CourseInfoDrawers';
import S from './styles';

const { Title, Text } = Typography;

const getCourseExtendedInfo = async (courseCode: string) => {
  return Promise.allSettled([
    getCourseInfo(courseCode),
    getCoursePrereqs(courseCode),
    getCourseTimetable(courseCode)
  ]);
};

type CourseDescriptionPanelProps = {
  className?: string;
  courseCode: string;
  onCourseClick?: (code: string) => void;
  planner?: PlannerResponse;
  courses?: CoursesResponse;
  degree?: DegreeResponse;
};

const CourseDescriptionPanel = ({
  className,
  courseCode,
  onCourseClick,
  planner,
  courses,
  degree
}: CourseDescriptionPanelProps) => {
  const coursesUnlockedQuery = useQuery({
    queryKey: ['coursesUnlocked', courseCode, degree, planner, courses],
    queryFn: () => getCoursesUnlockedWhenTaken(degree!, planner!, courses!, courseCode),
    enabled: !!degree && !!planner && !!courses
  });

  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  const courseInfoQuery = useQuery({
    queryKey: ['courseInfo', courseCode],
    queryFn: () => getCourseExtendedInfo(courseCode)
  });

  const loadingWrapper = (
    <S.Wrapper $sidebar={sidebar}>
      {!sidebar ? <LoadingCourseDescriptionPanelSidebar /> : <LoadingCourseDescriptionPanel />}
    </S.Wrapper>
  );

  if (courseInfoQuery.isPending || !courseInfoQuery.isSuccess) return loadingWrapper;

  const [courseRes, pathFromRes, courseCapRes] = courseInfoQuery.data;
  const course = unwrapSettledPromise(courseRes);
  const coursesPathFrom = unwrapSettledPromise(pathFromRes)?.courses;
  const courseCapacity = getEnrolmentCapacity(unwrapSettledPromise(courseCapRes));

  // course wasn't fetchable (fatal; should do proper error handling instead of indefinitely loading)
  if (!course) return loadingWrapper;
  return (
    <S.Wrapper $sidebar={sidebar} className={className}>
      <S.MainWrapper>
        <S.TitleWrapper $sidebar={sidebar}>
          <div>
            <Title level={2} className="text">
              {courseCode} - {course.title}
            </Title>
          </div>
          <PlannerButton
            course={course}
            isAddedInPlanner={courses !== undefined && courses[course.code] !== undefined}
          />
        </S.TitleWrapper>
        {/* TODO: Style this better? */}
        {course.is_legacy && (
          <Text strong>
            NOTE: this course is discontinued - if a current course exists, pick that instead
          </Text>
        )}

        {!sidebar && (
          <div style={{ flexBasis: '25%' }}>
            <CourseAttributes course={course} />
          </div>
        )}

        <CourseInfoDrawers
          course={course}
          pathFrom={coursesPathFrom}
          unlocked={coursesUnlockedQuery.data}
          onCourseClick={onCourseClick}
        />
      </S.MainWrapper>

      {sidebar && (
        <S.SidebarWrapper>
          <CourseAttributes course={course} courseCapacity={courseCapacity} />
        </S.SidebarWrapper>
      )}
    </S.Wrapper>
  );
};

export default React.memo(CourseDescriptionPanel);
