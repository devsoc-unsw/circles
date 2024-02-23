import React from 'react';
import { useLocation } from 'react-router-dom';
import { Progress, Rate, Typography } from 'antd';
import { Course } from 'types/api';
import { EnrolmentCapacityData } from 'types/courseCapacity';
import ProgressBar from 'components/ProgressBar';
import TermTag from 'components/TermTag';
import { TERM } from 'config/constants';
import S from './styles';

const { Title, Text } = Typography;

type CourseAttributesProps = {
  course: Course;
  courseCapacity?: EnrolmentCapacityData;
};

interface UnilectivesCourse {
  courseCode: string;
  archived: boolean;
  // attributes: any[];
  calendar: string;
  campus: string;
  description: string;
  enrolmentRules: string;
  equivalents: string[];
  exclusions: string[];
  faculty: string;
  fieldOfEducation: string;
  genEd: boolean;
  level: number;
  school: string;
  studyLevel: string;
  terms: number[];
  title: string;
  uoc: number;
  overallRating: number;
  manageability: number;
  usefulness: number;
  enjoyability: number;
  reviewCount: number;
}

const getCourseRating = async (code: string) => {
  const res = await fetch(`https://unilectives.devsoc.app/api/v1/course/${code}`);
  if (res.status !== 200) return undefined;
  return ((await res.json()) as { course: UnilectivesCourse }).course;
};

const CourseAttributes = ({ course, courseCapacity }: CourseAttributesProps) => {
  const { pathname } = useLocation();
  const sidebar = pathname === '/course-selector';

  const [rating, setRating] = React.useState<UnilectivesCourse | undefined>(undefined);

  React.useEffect(() => {
    const fetchRating = async () => {
      const r = await getCourseRating(course.code);
      if (r) setRating(r);
    };
    fetchRating();
  }, [course.code]);

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
            <S.Link
              href={`https://www.handbook.unsw.edu.au/${studyLevel.toLowerCase()}/courses/2023/${code}/`}
              target="_blank"
              rel="noreferrer"
            >
              View {code} in handbook
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
        },
        {
          title: 'Unilectives Rating',
          content: rating ? (
            <>
              <S.RatingWrapper>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={rating.enjoyability ? (rating.enjoyability / 5) * 100 : 0}
                    format={() =>
                      `${rating.enjoyability ? rating.enjoyability.toFixed(1) : '?'} / 5`
                    }
                    width={65}
                  />
                  <p style={{ fontSize: 'small' }}>Enjoyability</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={rating.usefulness ? (rating.usefulness / 5) * 100 : 0}
                    format={() => `${rating.usefulness ? rating.usefulness.toFixed(1) : '?'} / 5`}
                    width={65}
                  />
                  <p style={{ fontSize: 'small' }}>Usefulness</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="dashboard"
                    percent={rating.manageability ? (rating.manageability / 5) * 100 : 0}
                    format={() =>
                      `${rating.manageability ? rating.manageability.toFixed(1) : '?'} / 5`
                    }
                    width={65}
                  />
                  <p style={{ fontSize: 'small' }}>Manageability</p>
                </div>
              </S.RatingWrapper>
              <div style={{ textAlign: 'center' }}>
                <Rate
                  disabled
                  defaultValue={rating.overallRating ? rating.overallRating : 0}
                  allowHalf
                />
                <p>Overall Rating</p>
              </div>
              <S.Link
                href={`https://unilectives.csesoc.app/course/${code}/`}
                target="_blank"
                rel="noreferrer"
              >
                View full reviews on Unilectives
              </S.Link>
            </>
          ) : (
            <p>N/A</p>
          )
        }
      ]
    : [];

  return (
    <>
      {courseAttributesData.map(
        ({ title, content }) =>
          content && (
            <S.AttributeWrapper key={`course-attribute-${title}`}>
              <Title level={3} className="text">
                {title}
              </Title>
              <S.AttributeText>{content}</S.AttributeText>
            </S.AttributeWrapper>
          )
      )}
    </>
  );
};

export default CourseAttributes;
