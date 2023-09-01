import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useLocation } from 'react-router-dom';
import { Typography } from 'antd';
import axios from 'axios';
import { Course, CoursePathFrom, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';
import { CourseList } from 'types/courses';
import { PlannerResponse } from 'types/userResponse';
import { getUserDegree, getUserPlanner } from 'utils/api/userApi';
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
};

const CourseDescriptionPanel = ({
  className,
  courseCode,
  onCourseClick
}: CourseDescriptionPanelProps) => {
  const getCourseInfo = React.useCallback(async () => {
    const degreePromise = getUserDegree();
    const plannerPromise = getUserPlanner();
    const coursesUnlocked = Promise.all([degreePromise, plannerPromise]).then(
      async ([degree, planner]) => {
        const res = await axios.post<CoursesUnlockedWhenTaken>(
          `/courses/coursesUnlockedWhenTaken/${courseCode}`,
          JSON.stringify(prepareUserPayload(degree, planner))
        );
        return res;
      }
    );

    return Promise.allSettled([
      plannerPromise,
      axios.get<Course>(`/courses/getCourse/${courseCode}`),
      axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`),
      coursesUnlocked,
      axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${courseCode}`)
    ]);
  }, [courseCode]);

  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  const [planner, setPlanner] = useState<PlannerResponse>();
  const [course, setCourse] = useState<Course>();
  const [coursesPathFrom, setCoursesPathFrom] = useState<CourseList>();
  const [coursesUnlocked, setCoursesUnlocked] = useState<CoursesUnlockedWhenTaken>();
  const [courseCapacity, setCourseCapacity] = useState<EnrolmentCapacityData>();
  const [isChangingCourse, setIsChangingCourse] = useState<boolean>();

  function unwrap<T>(res: PromiseSettledResult<T>): T | undefined {
    if (res.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('Rejected request at unwrap', res.reason);
      return undefined;
    }
    return res.value;
  }

  const courseInfoQuery = useQuery(['courseInfo'], getCourseInfo, {
    onError: errLogger('getCourseInfo'),
    onSuccess: (data) => {
      const [plannerRes, courseRes, pathFromRes, unlockedRes, courseCapRes] = data;

      setPlanner(unwrap(plannerRes));
      setCourse(unwrap(courseRes)?.data);
      setCoursesPathFrom(unwrap(pathFromRes)?.data.courses);
      setCoursesUnlocked(unwrap(unlockedRes)?.data);
      setCourseCapacity(getEnrolmentCapacity(unwrap(courseCapRes)?.data));
      setIsChangingCourse(false);
    }
  });

  useEffect(() => {
    // if the course code changes, force a reload
    setIsChangingCourse(true);
    courseInfoQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseCode]);

  const isLoading = courseInfoQuery.isLoading || isChangingCourse;

  if (isLoading || !course) {
    // either still loading or the course wasn't fetchable (fatal)
    return (
      <S.Wrapper sidebar={sidebar}>
        {!sidebar ? <LoadingCourseDescriptionPanelSidebar /> : <LoadingCourseDescriptionPanel />}
      </S.Wrapper>
    );
  }

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
            planned={
              planner !== undefined &&
              (planner.courses[course.code] !== undefined ||
                planner.unplanned.includes(course.code))
            }
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
          unlocked={coursesUnlocked}
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

export default CourseDescriptionPanel;
