import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Typography } from 'antd';
import axios from 'axios';
import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';
import { CourseList } from 'types/courses';
import API from 'utils/api';
import prepareUserPayload from 'utils/api/prepareUserPayload';
import { APICourse, APICoursesUnlockedWhenTaken } from 'utils/api/types/responses';
import unwrap from 'utils/api/unwrapSettled';
import getEnrolmentCapacity from 'utils/getEnrolmentCapacity';
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
};

const CourseDescriptionPanel = ({
  className,
  courseCode,
  onCourseClick
}: CourseDescriptionPanelProps) => {
  const { degree, planner } = useSelector((state: RootState) => state);

  const { pathname } = useLocation();
  const sidebar = !!(pathname === '/course-selector');

  const [isLoading, setIsLoading] = useState(false);
  const [course, setCourse] = useState<APICourse>();
  const [coursesPathFrom, setCoursesPathFrom] = useState<CourseList>();
  const [coursesUnlocked, setCoursesUnlocked] = useState<APICoursesUnlockedWhenTaken>();
  const [courseCapacity, setCourseCapacity] = useState<EnrolmentCapacityData>();

  useEffect(() => {
    // if the course code changes, force a reload
    setIsLoading(true);
  }, [courseCode]);

  useEffect(() => {
    const getCourseInfo = async () => {
      try {
        const results = await Promise.allSettled([
          API.courses.course(courseCode),
          API.courses.pathFrom(courseCode),
          API.courses.unlockedWhenTaken(courseCode, prepareUserPayload(degree, planner)),
          axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${courseCode}`)
        ]);

        const [courseRes, pathFromRes, unlockedRes, courseCapRes] = results;

        setCourse(unwrap(courseRes)?.data);
        setCoursesPathFrom(unwrap(pathFromRes)?.data.courses);
        setCoursesUnlocked(unwrap(unlockedRes)?.data);
        setCourseCapacity(getEnrolmentCapacity(unwrap(courseCapRes)?.data));
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
  }, [courseCode, degree, isLoading, planner]);

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
          <PlannerButton course={course} />
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
