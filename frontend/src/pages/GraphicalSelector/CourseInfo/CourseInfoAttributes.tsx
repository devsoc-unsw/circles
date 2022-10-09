import React, { FunctionComponent } from 'react';
import { Typography } from 'antd';
import styled from 'styled-components';
import { Course } from 'types/api';
import { EnrolmentCapacityData } from 'types/courseCapacity';
import ProgressBar from 'components/ProgressBar';
import TermTag from 'components/TermTag';
import { TERM } from 'config/constants';

const { Title } = Typography;

interface CourseInfoAttributesProps {
  course?: Course;
  courseCapacity: EnrolmentCapacityData;
}

type CourseAttributeProps = {
  title: string;
  content: React.ReactNode;
};

const AttributeWrapper = styled.div`
  border-bottom: #d9d9d9 solid 1px; // grey-5
  padding: 10px 0;
`;

const CourseAttribute = ({ title, content }: CourseAttributeProps) => (
  <AttributeWrapper>
    <Title level={3} className="text">{title}</Title>
    {content}
  </AttributeWrapper>
);

const CourseInfoAttributes: FunctionComponent<CourseInfoAttributesProps> = ({
  course, courseCapacity,
}) => {
  const courseAttributesData = course ? [
    {
      title: 'Offering Terms',
      content: course.terms?.length
        ? course.terms.map((term) => {
          const termNo = term.slice(1);
          return (
            <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${termNo}`} />
          );
        })
        : 'None',
    },
    {
      title: 'UNSW Handbook',
      content: course.study_level ? (
        <a
          href={`https://www.handbook.unsw.edu.au/${course.study_level.toLowerCase()}/courses/2023/${course.code}/`}
          target="_blank"
          rel="noreferrer"
        >
          View {course.code} in handbook
        </a>
      ) : null,
    },
    {
      title: 'School',
      content: course.school,
    },
    {
      title: 'Study Level',
      content: course.study_level,
    },
    {
      title: 'Campus',
      content: course.campus,
    },
    {
      title: 'Course Capacity',
      content: courseCapacity && Object.keys(courseCapacity).length ? (
        <>
          <div>{courseCapacity.capacity} Students for {TERM}</div>
          <ProgressBar
            progress={
                Math.round((courseCapacity.enrolments / courseCapacity.capacity) * 1000) / 10
              }
          />
        </>
      ) : <p>No data available</p>,
    },
    {
      title: 'Units of Credit',
      content: course.UOC,
    },
  ] : [];
  return (
    <div>
      {courseAttributesData.map(({ title, content }) => (
        content && <CourseAttribute title={title} content={content} />
      ))}
    </div>
  );
};

export default CourseInfoAttributes;
