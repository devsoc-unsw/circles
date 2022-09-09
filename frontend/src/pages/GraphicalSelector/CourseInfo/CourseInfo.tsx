/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import React, {
  FunctionComponent,
  useEffect,
  useState,
} from 'react';
import { Typography } from 'antd';
import axios from 'axios';
import styled from 'styled-components';
import { Course } from 'types/api';
import Collapsible from 'components/Collapsible';
import TermTag from 'components/TermTag';
import PlannerButtonCode from './PlannerButtonCode';

const { Title } = Typography;

interface CourseInfoProps {
  courseCode: string;
}

const S = {
  Wrapper: styled.div`
    width: 100%;
    padding: 10px;
  `,

  TermWrapper: styled.div`
    margin-top: 20px;
  `,
};

const CourseInfo: FunctionComponent<CourseInfoProps> = ({ courseCode }) => {
  const [info, setInfo] = useState<Course | null>(null);

  // get the info
  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await axios.get<Course>(`/courses/getCourse/${courseCode}`);
        setInfo(res.data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourse', e);
      }
    };
    getInfo();
  }, [courseCode]);

  if (!info) {
    return (
      <div>{courseCode}: Loading...</div>
    );
  }

  const terms = info.terms?.length
    ? info.terms.map((term) => (
      <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${term.slice(1)}`} />
    ))
    : 'None';

  return (
    <S.Wrapper>
      <Title level={2} className="text">{courseCode} - {info.title}</Title>
      <PlannerButtonCode course={info} />
      <S.TermWrapper>
        {terms}
      </S.TermWrapper>
      <Collapsible title="Overview">
        <p>{info.description}</p>
      </Collapsible>
      <Collapsible title="Requirements" initiallyCollapsed>
        <p>{info.raw_requirements}</p>
      </Collapsible>
      <Collapsible title="Courses you have done to unlock this course" initiallyCollapsed>
        <p>...</p>
      </Collapsible>
      <Collapsible title="Doing this course will directly unlock these courses" initiallyCollapsed>
        <p>...</p>
      </Collapsible>
      <Collapsible title="Doing this course will indirectly unlock these courses" initiallyCollapsed>
        <p>...</p>
      </Collapsible>
    </S.Wrapper>
  );
};

export default CourseInfo;
