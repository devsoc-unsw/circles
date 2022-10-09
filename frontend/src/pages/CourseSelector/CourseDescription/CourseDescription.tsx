import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Typography } from 'antd';
import axios from 'axios';
import { Course, CoursePathFrom, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseTimetable, EnrolmentCapacityData } from 'types/courseCapacity';
import { CourseList } from 'types/courses';
import prepareUserPayload from 'utils/prepareUserPayload';
import infographic from 'assets/infographicFontIndependent.svg';
import Collapsible from 'components/Collapsible';
import CourseTag from 'components/CourseTag';
import { LoadingCourseInfo } from 'components/LoadingSkeleton';
import PlannerButton from 'components/PlannerButton';
import PrerequisiteTree from 'components/PrerequisiteTree';
import ProgressBar from 'components/ProgressBar';
import TermTag from 'components/TermTag';
import { inDev, TERM, TIMETABLE_API_URL } from 'config/constants';
import type { RootState } from 'config/store';
import { setCourse } from 'reducers/coursesSlice';
import S from './styles';

const { Title, Text } = Typography;

type CourseAttributeProps = {
  title: string;
  content: React.ReactNode;
};

const CourseAttribute = ({ title, content }: CourseAttributeProps) => (
  <S.AttributeWrapper>
    <Title level={3} className="text">
      {title}
    </Title>
    {content}
  </S.AttributeWrapper>
);

const CourseDescription = () => {
  const dispatch = useDispatch();
  const { active, tabs } = useSelector((state: RootState) => state.courseTabs);
  const id = tabs[active];

  const { course } = useSelector((state: RootState) => state.courses);
  const { degree, planner } = useSelector((state: RootState) => state);

  const [pageLoaded, setPageLoaded] = useState(false);
  const [coursesPathTo, setCoursesPathTo] = useState<CoursesUnlockedWhenTaken | null>(null);
  const [coursesPathFrom, setCoursesPathFrom] = useState<CourseList>([]);
  const [courseCapacity, setCourseCapacity] = useState<EnrolmentCapacityData | null>(null);

  useEffect(() => {
    const getCourse = async (courseCode: string) => {
      try {
        const res = await axios.get<Course>(`/courses/getCourse/${courseCode}`);
        dispatch(setCourse(res.data));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourse', e);
      }
    };

    const getPathToCoursesById = async (courseCode: string) => {
      try {
        const res = await axios.post<CoursesUnlockedWhenTaken>(
          `/courses/coursesUnlockedWhenTaken/${courseCode}`,
          JSON.stringify(prepareUserPayload(degree, planner))
        );
        setCoursesPathTo(res.data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getPathToCoursesById', e);
      }
    };

    const getPathFromCoursesById = async (courseCode: string) => {
      try {
        const res = await axios.get<CoursePathFrom>(`/courses/getPathFrom/${courseCode}`);
        setCoursesPathFrom(res.data.courses);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getPathFromCoursesById', e);
      }
    };

    const getCapacityAndEnrolment = (data: CourseTimetable) => {
      const enrolmentCapacityData: EnrolmentCapacityData = {
        enrolments: 0,
        capacity: 0
      };
      for (let i = 0; i < data.classes.length; i++) {
        if (
          data.classes[i].activity === 'Lecture' ||
          data.classes[i].activity === 'Seminar' ||
          data.classes[i].activity === 'Thesis Research' ||
          data.classes[i].activity === 'Project'
        ) {
          enrolmentCapacityData.enrolments += data.classes[i].courseEnrolment.enrolments;
          enrolmentCapacityData.capacity += data.classes[i].courseEnrolment.capacity;
        }
      }
      setCourseCapacity(enrolmentCapacityData);
    };

    const getCourseCapacityById = async (code: string) => {
      try {
        const res = await axios.get<CourseTimetable>(`${TIMETABLE_API_URL}/${code}`);
        getCapacityAndEnrolment(res.data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourseCapacityById', e);
      }
    };

    const fetchCourseData = async (courseCode: string) => {
      setPageLoaded(false);
      await Promise.all([
        getCourse(courseCode),
        getPathFromCoursesById(courseCode),
        getPathToCoursesById(courseCode),
        getCourseCapacityById(courseCode)
      ]);
      setPageLoaded(true);
    };

    if (id) fetchCourseData(id);
  }, [dispatch, id]);

  const courseAttributesData = course
    ? [
        {
          title: 'Offering Terms',
          content: course.terms?.length
            ? course.terms.map((term) => {
                const termNo = term.slice(1);
                return <TermTag key={term} name={term === 'T0' ? 'Summer' : `Term ${termNo}`} />;
              })
            : 'None'
        },
        {
          title: 'UNSW Handbook',
          content: course.study_level ? (
            <a
              href={`https://www.handbook.unsw.edu.au/${course.study_level.toLowerCase()}/courses/2023/${
                course.code
              }/`}
              target="_blank"
              rel="noreferrer"
            >
              View {course.code} in handbook
            </a>
          ) : null
        },
        {
          title: 'School',
          content: course.school
        },
        {
          title: 'Study Level',
          content: course.study_level
        },
        {
          title: 'Campus',
          content: course.campus
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
          content: course.UOC
        }
      ]
    : [];

  if (tabs.length === 0) {
    return (
      <S.InfographicContainer>
        <img src={infographic} alt="How to use Circles infographic" />
      </S.InfographicContainer>
    );
  }

  return (
    <S.DescriptionWrapper>
      {!pageLoaded ? (
        <LoadingCourseInfo />
      ) : (
        <>
          <S.DescriptionContent>
            <S.DescriptionTitleBar>
              <Title level={2} className="text">{id} - {course?.title}</Title>
              {course ? <PlannerButton course={course} /> : undefined}
            </S.DescriptionTitleBar>
            {course?.is_legacy && (
              <Text strong>
                NOTE: this course is discontinued - if a current course exists, pick that instead
              </Text>
            )}
            <Collapsible title="Overview">
              {/* eslint-disable-next-line react/no-danger */}
              <p dangerouslySetInnerHTML={{ __html: course?.description || 'None' }} />
            </Collapsible>
            <Collapsible title="Requirements">
              {/* eslint-disable-next-line react/no-danger */}
              <p dangerouslySetInnerHTML={{ __html: course?.raw_requirements || 'None' }} />
            </Collapsible>
            <Collapsible title="Courses you have done to unlock this course">
              <p>
                {coursesPathFrom && coursesPathFrom.length > 0
                  ? coursesPathFrom
                      .filter((courseCode) => Object.keys(planner.courses).includes(courseCode))
                      .map((courseCode) => <CourseTag key={courseCode} name={courseCode} />)
                  : 'None'}
              </p>
            </Collapsible>
            <Collapsible title="Doing this course will directly unlock these courses">
              <p>
                {coursesPathTo?.direct_unlock && coursesPathTo.direct_unlock.length > 0
                  ? coursesPathTo.direct_unlock.map((courseCode) => (
                      <CourseTag key={courseCode} name={courseCode} />
                    ))
                  : 'None'}
              </p>
            </Collapsible>
            <Collapsible
              title="Doing this course will indirectly unlock these courses"
              initiallyCollapsed
            >
              <p>
                {coursesPathTo?.indirect_unlock && coursesPathTo.indirect_unlock.length > 0
                  ? coursesPathTo.indirect_unlock.map((courseCode) => (
                      <CourseTag key={courseCode} name={courseCode} />
                    ))
                  : 'None'}
              </p>
            </Collapsible>
            {inDev && (
              <Collapsible title="Prerequisite Visualisation">
                <PrerequisiteTree courseCode={id} />
              </Collapsible>
            )}
            <br />
          </S.DescriptionContent>
          <S.AttributesContent>
            {courseAttributesData.map(
              ({ title, content }) => content && <CourseAttribute title={title} content={content} />
            )}
          </S.AttributesContent>
        </>
      )}
    </S.DescriptionWrapper>
  );
};

export default CourseDescription;
