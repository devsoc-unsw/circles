import React from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { Typography } from 'antd';
import axios from 'axios';
import { Course, CoursePathFrom, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseTimetable } from 'types/courseCapacity';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import getEnrolmentCapacity from 'utils/getEnrolmentCapacity';
import prepareUserPayload from 'utils/prepareUserPayload';
import { errLogger } from 'utils/queryUtils';
import {
  LoadingCourseDescriptionPanel,
  LoadingCourseDescriptionPanelSidebar
} from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import { TIMETABLE_API_URL } from 'config/constants';
import CourseAttributes from './CourseAttributes';
import CourseInfoDrawers from './CourseInfoDrawers';
import S from './styles';

const { Title, Text } = Typography;

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
  const getCoursesUnlocked = React.useCallback(async () => {
    if (!degree || !planner || !courses)
      return Promise.reject(new Error('degree, planner or courses undefined'));
    const res = await axios.post<CoursesUnlockedWhenTaken>(
      `/courses/coursesUnlockedWhenTaken/${courseCode}`,
      JSON.stringify(prepareUserPayload(degree, planner, courses))
    );
    return res.data;
  }, [courseCode, degree, planner, courses]);

  const getCourseInfo = React.useCallback(async () => {
    return Promise.allSettled([
      axios.get<Course>(`/courses/getCourse/${courseCode}`),
      axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`),
      axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${courseCode}`)
    ]);
  }, [courseCode]);

  const coursesUnlockedQuery = useQuery(
    ['coursesUnlocked', courseCode, degree, planner, courses],
    getCoursesUnlocked,
    {
      onError: errLogger('coursesUnlockedQuery'),
      enabled: !!degree && !!planner && !!courses
    }
  );

  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  function unwrap<T>(res: PromiseSettledResult<T>): T | undefined {
    if (res.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('Rejected request at unwrap', res.reason);
      return undefined;
    }
    return res.value;
  }

  const courseInfoQuery = useQuery(['courseInfo', courseCode], getCourseInfo, {
    onError: errLogger('getCourseInfo')
  });

  const loadingWrapper = (
    <S.Wrapper sidebar={sidebar}>
      {!sidebar ? <LoadingCourseDescriptionPanelSidebar /> : <LoadingCourseDescriptionPanel />}
    </S.Wrapper>
  );

  const { isLoading } = courseInfoQuery; // || coursesUnlockedQuery.isLoading;
  if (isLoading || !courseInfoQuery.isSuccess) return loadingWrapper;

  const [courseRes, pathFromRes, courseCapRes] = courseInfoQuery.data;
  const course = unwrap(courseRes)?.data;
  const coursesPathFrom = unwrap(pathFromRes)?.data.courses;
  const courseCapacity = getEnrolmentCapacity(unwrap(courseCapRes)?.data);

  // course wasn't fetchable (fatal; should do proper error handling instead of indefinitely loading)
  if (!course) return loadingWrapper;
  return (
    <S.Wrapper sidebar={sidebar} className={className}>
      <S.MainWrapper>
        <S.TitleWrapper sidebar={sidebar}>
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
