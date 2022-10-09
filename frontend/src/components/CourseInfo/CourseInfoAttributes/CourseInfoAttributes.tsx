import React, { FunctionComponent } from 'react';
import { Typography } from 'antd';
import { Course } from 'types/api';
import { EnrolmentCapacityData } from 'types/courseCapacity';
import ProgressBar from 'components/ProgressBar';
import TermTag from 'components/TermTag';
import { TERM } from 'config/constants';
import S from './styles';

const { Title, Text } = Typography;

type CourseInfoAttributesProps = {
  course: Course,
  concise?: boolean,
  courseCapacity?: EnrolmentCapacityData
};

const CourseInfoAttributes: FunctionComponent<CourseInfoAttributesProps> = ({
  course, concise, courseCapacity,
}) => {
  const termTags = course.terms?.length
    ? course.terms.map((term) => {
      const termNo = term.slice(1);
      return (
        <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${termNo}`} />
      );
    })
    : 'None';

  const handbookLink = course.study_level && (
    <a
      href={`https://www.handbook.unsw.edu.au/${course.study_level.toLowerCase()}/courses/2023/${course.code}/`}
      target="_blank"
      rel="noreferrer"
    >
      View {course.code} in handbook
    </a>
  );

  if (concise) {
    return (
      <div>
        <S.TermWrapper>
          <Text strong>Terms: </Text>
          {termTags}
        </S.TermWrapper>
        <S.AttributesWrapperConcise>
          <S.AttributeConcise>
            <div>
              <Text>{course.study_level}</Text>
            </div>
            <div>
              <Text>{course.campus}</Text>
            </div>
          </S.AttributeConcise>
          <S.AttributeConcise>
            <Text>{course.school}</Text>
          </S.AttributeConcise>
          <S.AttributeConcise>
            <div>
              <Text strong>{course.UOC} UOC</Text>
            </div>
            <div>
              <Text>View Handbook</Text>
            </div>
          </S.AttributeConcise>
        </S.AttributesWrapperConcise>
      </div>
    );
  }

  return (
    <div>
      <S.Attribute>
        <Title level={3} className="text">Offering Terms</Title>
        {termTags}
      </S.Attribute>
      <S.Attribute>
        <Title level={3} className="text">UNSW Handbook</Title>
        {handbookLink}
      </S.Attribute>
      <S.Attribute>
        <Title level={3} className="text">School</Title>
        {course.school}
      </S.Attribute>
      <S.Attribute>
        <Title level={3} className="text">Study Level</Title>
        {course.study_level}
      </S.Attribute>
      <S.Attribute>
        <Title level={3} className="text">Campus</Title>
        {course.campus}
      </S.Attribute>
      {courseCapacity
        && (
        <S.Attribute>
          <Title level={3} className="text">Course Capacity</Title>
          <div>{courseCapacity.capacity} Students for {TERM}</div>
          <ProgressBar
            progress={Math.round((courseCapacity.enrolments / courseCapacity.capacity) * 1000) / 10}
          />
        </S.Attribute>
        )}
      <S.Attribute>
        <Title level={3} className="text">Units of Credit</Title>
        {course.UOC}
      </S.Attribute>
    </div>
  );
};

export default CourseInfoAttributes;
