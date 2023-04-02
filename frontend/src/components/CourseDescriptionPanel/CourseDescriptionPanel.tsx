import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Typography } from 'antd';
import axios from 'axios';
import { Course, CoursePathFrom, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';
import { CourseDescInfoResCache } from 'types/courseDescription';
import { CourseList } from 'types/courses';
import getEnrolmentCapacity from 'utils/getEnrolmentCapacity';
import prepareUserPayload from 'utils/prepareUserPayload';
import {
  LoadingCourseDescriptionPanel,
  LoadingCourseDescriptionPanelSidebar
} from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import { TIMETABLE_API_URL } from 'config/constants';
import type { RootState } from 'config/store';
import CourseAttributes from './CourseAttributes';
import CourseInfoDrawers from './CourseInfoDrawers';
import S from './styles';

const { Title, Text } = Typography;

type CourseDescriptionPanelProps = {
  className?: string;
  courseCode: string;
  onCourseClick?: (code: string) => void;
  courseDescInfoCache: React.MutableRefObject<CourseDescInfoResCache>;
  hasPlannerUpdated: React.MutableRefObject<boolean>;
};

const CourseDescriptionPanel = ({
  className,
  courseCode,
  onCourseClick,
  courseDescInfoCache,
  hasPlannerUpdated
}: CourseDescriptionPanelProps) => {
  const { degree, planner } = useSelector((state: RootState) => state);

  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<Course>();
  const [coursesPathFrom, setCoursesPathFrom] = useState<CourseList>();
  const [coursesUnlocked, setCoursesUnlocked] = useState<CoursesUnlockedWhenTaken>();
  const [courseCapacity, setCourseCapacity] = useState<EnrolmentCapacityData>();

  function unwrap<T>(res: PromiseSettledResult<T>): T | undefined {
    if (res.status === 'rejected') {
      // eslint-disable-next-line no-console
      console.error('Rejected request at unwrap', res.reason);
      return undefined;
    }
    return res.value;
  }

  useEffect(() => {
    // if the course code changes, force a reload
    setIsLoading(true);
  }, [courseCode]);

  useEffect(() => {
    const getCourseInfo = async () => {
      try {
        // if it's not saved already then fetch it
        if (!courseDescInfoCache.current[courseCode]) {
          const results = await Promise.allSettled([
            axios.get<Course>(`/courses/getCourse/${courseCode}`),
            axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`),
            axios.post<CoursesUnlockedWhenTaken>(
              `/courses/coursesUnlockedWhenTaken/${courseCode}`,
              JSON.stringify(prepareUserPayload(degree, planner))
            ),
            axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${courseCode}`)
          ]);

          const [courseRes, pathFromRes, unlockedRes, courseCapRes] = results;

          courseDescInfoCache.current[courseCode] = {
            course: unwrap(courseRes)?.data,
            pathFrom: unwrap(pathFromRes)?.data.courses,
            unlocked: unwrap(unlockedRes)?.data,
            courseCap: getEnrolmentCapacity(unwrap(courseCapRes)?.data)
          };
        }

        const {
          course: courseData,
          pathFrom,
          unlocked,
          courseCap
        } = courseDescInfoCache.current[courseCode];

        setCourse(courseData);
        setCoursesPathFrom(pathFrom);
        setCoursesUnlocked(unlocked);
        setCourseCapacity(courseCap);
        setIsLoading(false);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourse', e);
      }
    };

    if (isLoading) {
      // gets the associated info for a course
      getCourseInfo();
    }
  }, [courseCode, courseDescInfoCache, degree, isLoading, planner]);

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
          <PlannerButton course={course} hasPlannerUpdated={hasPlannerUpdated} />
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
