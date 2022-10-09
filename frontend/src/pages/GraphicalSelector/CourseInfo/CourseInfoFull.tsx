import React, {
  FunctionComponent,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import axios from 'axios';
import { Course, CoursePathFrom, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';
import { CourseList } from 'types/courses';
import prepareUserPayload from 'utils/prepareUserPayload';
import { LoadingCourseInfo, LoadingCourseInfoConcise } from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import { TIMETABLE_API_URL } from 'config/constants';
import { RootState } from 'config/store';
import CourseInfoAttributes from './CourseInfoAttributes';
import CourseInfoDrawers from './CourseInfoDrawers';
import { getEnrolmentCapacity, unwrap } from './helpers';
import S from './stylesFull';

const { Title, Text } = Typography;

interface CourseInfoFullProps {
  courseCode: string;
  concise?: boolean;
  onCourseClick?: (code: string) => void;
}

type CourseUserInfo = {
  course?: Course;
  pathFrom?: CourseList;
  unlocked?: CoursesUnlockedWhenTaken;
  courseCapacity?: EnrolmentCapacityData;
};

const CourseInfoFull: FunctionComponent<CourseInfoFullProps> = ({
  courseCode,
  concise,
  onCourseClick,
}) => {
  const [info, setInfo] = useState<CourseUserInfo | null>(null);
  const { degree, planner } = useSelector((state: RootState) => state);

  // get the info
  useEffect(() => {
    const getInfo = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get<Course>(`/courses/getCourse/${courseCode}`),
          axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`),
          axios.post<CoursesUnlockedWhenTaken>(`/courses/coursesUnlockedWhenTaken/${courseCode}`, JSON.stringify(prepareUserPayload(degree, planner))),
          axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${courseCode}`),
        ]);

        setInfo({
          course: unwrap(results[0])?.data,
          pathFrom: unwrap(results[1])?.data.courses,
          unlocked: unwrap(results[2])?.data,
          courseCapacity: getEnrolmentCapacity(unwrap(results[3])?.data),
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourse', e);
      }
    };
    getInfo();
  }, [courseCode, degree, planner]);

  if (!info || !info?.course) {
    // either still loading or the course wasn't fetchable (fatal)
    return (
      <S.Wrapper concise={concise}>
        {concise ? <LoadingCourseInfoConcise /> : <LoadingCourseInfo />}
      </S.Wrapper>
    );
  }

  const {
    course, pathFrom, unlocked, courseCapacity,
  } = info;

  return (
    <S.Wrapper concise={concise}>
      <S.MainWrapper>
        <S.TitleWrapper concise={concise}>
          <div><Title level={2} className="text">{courseCode} - {course.title}</Title></div>
          <PlannerButton course={course} />
        </S.TitleWrapper>
        {
          course.is_legacy
          && (
            <Text strong>
              NOTE: this course is discontinued - if a current course exists, pick that instead
            </Text>
          )
        }

        {concise && (
        <div style={{ flexBasis: '25%' }}>
          <CourseInfoAttributes course={course} concise />
        </div>
        )}

        <CourseInfoDrawers
          course={course}
          pathFrom={pathFrom}
          planner={planner}
          prereqVis={!concise}
          unlocked={unlocked}
          onCourseClick={onCourseClick}
        />
      </S.MainWrapper>

      {!concise
      && (
      <S.SidebarWrapper>
        <CourseInfoAttributes course={course} courseCapacity={courseCapacity} />
      </S.SidebarWrapper>
      )}

    </S.Wrapper>
  );
};

export default CourseInfoFull;
