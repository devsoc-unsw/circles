import React from 'react';
import { useLocation } from 'react-router-dom';
import { Typography } from 'antd';
import { EnrolmentCapacityData } from 'types/courseCapacity';
import { APICourse } from 'utils/api/types/responses';
import ProgressBar from 'components/ProgressBar';
import TermTag from 'components/TermTag';
import { TERM } from 'config/constants';
import S from './styles';

const { Title, Text } = Typography;

type CourseAttributesProps = {
  course: APICourse;
  courseCapacity?: EnrolmentCapacityData;
};

const CourseAttributes = ({ course, courseCapacity }: CourseAttributesProps) => {
  const { pathname } = useLocation();
  const sidebar = !!(pathname === '/course-selector');

  const { study_level: studyLevel, terms, campus, code, school, UOC } = course;

  const termTags = terms?.length
    ? terms.map((term) => {
        const termNo = term.slice(1);
        return <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${termNo}`} />;
      })
    : 'None';

  if (!sidebar) {
    return (
      <div>
        <S.TermWrapper>{termTags !== 'None' && termTags}</S.TermWrapper>
        <S.AttributesWrapperConcise>
          <S.AttributeConcise>
            <div>
              <Text>{studyLevel}</Text>
            </div>
            <div>
              <Text>{campus}</Text>
            </div>
          </S.AttributeConcise>
          <S.AttributeConcise>
            <Text>{school}</Text>
          </S.AttributeConcise>
          <S.AttributeConcise>
            <div>
              <Text strong>{UOC} UOC</Text>
            </div>
            <div>
              <Text>View Handbook</Text>
            </div>
          </S.AttributeConcise>
        </S.AttributesWrapperConcise>
      </div>
    );
  }

  // course selector attribute view
  const courseAttributesData = course
    ? [
        {
          title: 'Offering Terms',
          content: termTags
        },
        {
          title: 'UNSW Handbook',
          content: studyLevel ? (
            <a
              href={`https://www.handbook.unsw.edu.au/${studyLevel.toLowerCase()}/courses/2023/${code}/`}
              target="_blank"
              rel="noreferrer"
            >
              View {code} in handbook
            </a>
          ) : null
        },
        {
          title: 'School',
          content: school
        },
        {
          title: 'Study Level',
          content: studyLevel
        },
        {
          title: 'Campus',
          content: campus
        },
        {
          title: 'Course Capacity',
          content:
            courseCapacity && Object.keys(courseCapacity).length ? (
              <>
                <div>
                  {courseCapacity.capacity} Students for {TERM}
                </div>
                <ProgressBar
                  progress={
                    Math.round((courseCapacity.enrolments / courseCapacity.capacity) * 1000) / 10
                  }
                />
              </>
            ) : (
              <p>No data available</p>
            )
        },
        {
          title: 'Units of Credit',
          content: UOC
        }
      ]
    : [];

  return (
    <>
      {courseAttributesData.map(
        ({ title, content }) =>
          content && (
            <S.AttributeWrapper>
              <Title level={3} className="text">
                {title}
              </Title>{' '}
              <S.AttributeText>{content}</S.AttributeText>{' '}
            </S.AttributeWrapper>
          )
      )}
    </>
  );
};

export default CourseAttributes;
