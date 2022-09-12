/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import React, {
  FunctionComponent,
  MouseEventHandler,
  useEffect,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import { Tag, Typography } from 'antd';
import axios from 'axios';
import styled, { css } from 'styled-components';
import { Course, CoursePathFrom, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseList } from 'types/courses';
import prepareUserPayload from 'utils/prepareUserPayload';
import Collapsible from 'components/Collapsible';
import TermTag from 'components/TermTag';
import { RootState } from 'config/store';
import GraphicalCourseTag from './GraphicalCourseTag';
import LoadingCourseInfo from './LoadingCourseInfo';
import PlannerButtonCode from './PlannerButtonCode';

const { Title, Text } = Typography;

interface CourseInfoProps {
  courseCode: string;
  onCourseClick?: (code: string) => void;
}

const S = {
  Wrapper: styled.div`
    width: 100%;
    padding: 10px;
  `,

  TermWrapper: styled.div`
    margin-top: 20px;
  `,

  MiscInfo: styled.div`
    display: flex;
    justify-content: space-evenly;
  `,

  MiscInfoChild: styled.div`
    padding: 16px 4px;
    flex: 1 1 0;
    text-align: center;

    &:nth-child(2) {
      border-left: #d9d9d9c0 solid 1px;
      border-right: #d9d9d9c0 solid 1px;
    }
  `,
};

type CourseUserInfo = {
  course: Course;
  pathFrom: CourseList;
  unlocked: CoursesUnlockedWhenTaken;
};

const CourseInfo: FunctionComponent<CourseInfoProps> = ({ courseCode, onCourseClick }) => {
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
        ]);

        setInfo({
          course: results[0].data,
          pathFrom: results[1].data.courses,
          unlocked: results[2].data,
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

  const { course, pathFrom, unlocked } = info;

  return (
    <S.Wrapper>
      <Title level={2} className="text">{courseCode} - {course.title}</Title>
      <PlannerButtonCode course={course} />
      <S.TermWrapper>
        <Text strong>Terms: </Text>
        {course.terms.length
          ? course.terms.map((term) => (
            <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${term.slice(1)}`} />
          ))
          : 'None'}
      </S.TermWrapper>
      <S.MiscInfo>
        <S.MiscInfoChild>
          <Text>{course.study_level}</Text>
          <br />
          <Text>{course.campus}</Text>
        </S.MiscInfoChild>
        <S.MiscInfoChild>
          <Text>{course.school}</Text>
        </S.MiscInfoChild>
        <S.MiscInfoChild>
          <Text strong>{course.UOC} UOC</Text>
          <br />
          <Text>View Handbook</Text>
        </S.MiscInfoChild>
      </S.MiscInfo>
      <Collapsible title="Overview">
        <p>{course.description}</p>
      </Collapsible>
      <Collapsible title="Requirements" initiallyCollapsed>
        <p>{course.raw_requirements}</p>
      </Collapsible>
      <Collapsible title="Courses you have done to unlock this course" initiallyCollapsed>
        <p>
          {pathFrom && pathFrom.length > 0 ? (
            pathFrom
              .filter((code) => Object.keys(planner.courses).includes(code))
              .map((code) => (
                onCourseClick
                  ? <GraphicalCourseTag key={code} name={code} onClick={() => { onCourseClick(code); }} />
                  : <GraphicalCourseTag key={code} name={code} />
              ))
          ) : 'None'}
        </p>
      </Collapsible>
      <Collapsible title="Doing this course will directly unlock these courses" initiallyCollapsed>
        <p>
          {unlocked.direct_unlock && unlocked.direct_unlock.length > 0 ? (
            unlocked.direct_unlock.map((code) => (
              onCourseClick
                ? <GraphicalCourseTag key={code} name={code} onClick={() => { onCourseClick(code); }} />
                : <GraphicalCourseTag key={code} name={code} />
            ))
          ) : 'None'}
        </p>
      </Collapsible>
      <Collapsible title="Doing this course will indirectly unlock these courses" initiallyCollapsed>
        <p>
          {unlocked.indirect_unlock && unlocked.indirect_unlock.length > 0 ? (
            unlocked.indirect_unlock.map((code) => (
              onCourseClick
                ? <GraphicalCourseTag key={code} name={code} onClick={() => { onCourseClick(code); }} />
                : <GraphicalCourseTag key={code} name={code} />
            ))
          ) : 'None'}
        </p>
      </Collapsible>
    </S.Wrapper>
  );
};

export default CourseInfo;
