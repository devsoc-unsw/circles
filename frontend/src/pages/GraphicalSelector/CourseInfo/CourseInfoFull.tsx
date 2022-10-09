/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
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
import Collapsible from 'components/Collapsible';
import PlannerButton from 'components/PlannerButton';
import PrerequisiteTree from 'components/PrerequisiteTree';
import TermTag from 'components/TermTag';
import { inDev, TIMETABLE_API_URL } from 'config/constants';
import { RootState } from 'config/store';
import CourseInfoAttributes from './CourseInfoAttributes';
import CourseInfoDrawers from './CourseInfoDrawers';
import GraphicalCourseTag from './GraphicalCourseTag';
import LoadingCourseInfo from './LoadingCourseInfo';
import S from './stylesFull';

const { Title, Text } = Typography;

interface CourseInfoFullProps {
  courseCode: string;
  onCourseClick?: (code: string) => void;
  // onCourseAdd?: () => void;
}

type CourseUserInfo = {
  course: Course;
  pathFrom: CourseList;
  unlocked: CoursesUnlockedWhenTaken;
  courseCapacity: EnrolmentCapacityData;
};

const getCapacityAndEnrolment = (data: CourseTimetable): EnrolmentCapacityData => {
  const enrolmentCapacityData: EnrolmentCapacityData = {
    enrolments: 0,
    capacity: 0,
  };
  for (let i = 0; i < data.classes.length; i++) {
    if (
      data.classes[i].activity === 'Lecture'
      || data.classes[i].activity === 'Seminar'
      || data.classes[i].activity === 'Thesis Research'
      || data.classes[i].activity === 'Project'
    ) {
      enrolmentCapacityData.enrolments
        += data.classes[i].courseEnrolment.enrolments;
      enrolmentCapacityData.capacity
        += data.classes[i].courseEnrolment.capacity;
    }
  }
  return enrolmentCapacityData;
};

const CourseInfoFull: FunctionComponent<CourseInfoFullProps> = ({
  courseCode,
  onCourseClick,
}) => {
  const [info, setInfo] = useState<CourseUserInfo | null>(null);
  const { degree, planner } = useSelector((state: RootState) => state);

  // get the info
  useEffect(() => {
    const getInfo = async () => {
      try {
        const results = await Promise.all([
          axios.get<Course>(`/courses/getCourse/${courseCode}`),
          axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`),
          axios.post<CoursesUnlockedWhenTaken>(`/courses/coursesUnlockedWhenTaken/${courseCode}`, JSON.stringify(prepareUserPayload(degree, planner))),
          axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${courseCode}`),
        ]);

        setInfo({
          course: results[0].data,
          pathFrom: results[1].data.courses,
          unlocked: results[2].data,
          courseCapacity: getCapacityAndEnrolment(results[3].data),
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourse', e);
      }
    };
    getInfo();
  }, [courseCode, degree, planner]);

  if (!info) {
    return (
      <S.Wrapper>
        <LoadingCourseInfo />
      </S.Wrapper>
    );
  }

  const {
    course, pathFrom, unlocked, courseCapacity,
  } = info;

  return (
    <S.Wrapper>
      <div style={{ flexBasis: '75%', flexGrow: '1' }}>
        <S.TitleWrapper>
          <div><Title level={2} className="text">{courseCode} - {course.title}</Title></div>
          <PlannerButton course={course} />
        </S.TitleWrapper>
        {/* <S.TermWrapper>
          <Text strong>Terms: </Text>
          {course.terms.length
            ? course.terms.map((term) => (
              <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${term.slice(1)}`} />
            ))
            : 'None'}
        </S.TermWrapper>
        <S.MiscInfo>
          <S.MiscInfoChild>
            <div>
              <Text>{course.study_level}</Text>
            </div>
            <div>
              <Text>{course.campus}</Text>
            </div>
          </S.MiscInfoChild>
          <S.MiscInfoChild>
            <Text>{course.school}</Text>
          </S.MiscInfoChild>
          <S.MiscInfoChild>
            <div>
              <Text strong>{course.UOC} UOC</Text>
            </div>
            <div>
              <Text>View Handbook</Text>
            </div>
          </S.MiscInfoChild>
        </S.MiscInfo> */}
        {/* <CourseInfoDrawers
          course={course}
          pathFrom={pathFrom}
          planner={planner}
          prereqVis
          unlocked={unlocked}
        /> */}
      </div>
      <div style={{ flexBasis: '25%' }}>
        {/* <CourseInfoAttributes course={course} courseCapacity={courseCapacity} /> */}
      </div>
    </S.Wrapper>
  );
};

export default CourseInfoFull;
