import React from 'react';
import { useLocation } from 'react-router-dom';
import { TeamOutlined } from '@ant-design/icons';
import { Tag, Typography } from 'antd';
import { Course } from 'types/api';
import getMostRecentPastTerm from 'utils/getMostRecentPastTerm';
import TermTag from 'components/TermTag';
import { CURR_YEAR } from 'config/constants';
import S from './styles';

const { Text } = Typography;

const termMapping: Record<number, string> = {
  0: 'Summer',
  1: 'Term%201',
  2: 'Term%202',
  3: 'Term%203'
};

type CourseAttributesProps = {
  course: Course;
};

const CourseAttributes = ({ course }: CourseAttributesProps) => {
  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  const { study_level: studyLevel, terms, campus, code, school, UOC, groupwork } = course;

  const currentTerm = getMostRecentPastTerm(CURR_YEAR).T;

  const recentTermNumber = terms?.length ? parseInt(terms[0].slice(1), 10) : currentTerm;

  const yearCourseAvaliable = recentTermNumber > currentTerm ? CURR_YEAR - 1 : CURR_YEAR;

  const updatedTerm = recentTermNumber > currentTerm ? recentTermNumber : currentTerm;

  const teachingPeriod = updatedTerm > 0 ? `T${updatedTerm}` : 'U0';

  const termMod = termMapping[updatedTerm];

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
          title: 'Group Work',
          // Only surface the indicator when the course has group work, mirroring the
          // Term Planner where the indicator only appears for group work courses.
          content: groupwork ? (
            <Tag icon={<TeamOutlined />} color="purple">
              This course has group work
            </Tag>
          ) : null
        },
        {
          title: 'UNSW Handbook',
          content: studyLevel ? (
            <S.Link
              href={`https://www.handbook.unsw.edu.au/${studyLevel.toLowerCase()}/courses/${CURR_YEAR}/${code}/`}
              target="_blank"
              rel="noreferrer"
            >
              View {code} in handbook
            </S.Link>
          ) : null
        },
        {
          title: 'UNSW Course Outline',
          content: studyLevel ? (
            <S.Link
              href={`https://www.unsw.edu.au/course-outlines/course-outline#year=${yearCourseAvaliable}&term=${termMod}&deliveryMode=Multimodal&deliveryFormat=Standard&teachingPeriod=${teachingPeriod}&deliveryLocation=Kensington&courseCode=${code}&activityGroupId=1`}
              target="_blank"
              rel="noreferrer"
            >
              View {code} in Course Outline
            </S.Link>
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
            <S.AttributeWrapper key={`course-attribute-${title}`}>
              <h3 className="text">{title}</h3>
              <S.AttributeText>{content}</S.AttributeText>
            </S.AttributeWrapper>
          )
      )}
    </>
  );
};

export default CourseAttributes;
