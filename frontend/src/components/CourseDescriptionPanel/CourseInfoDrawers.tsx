import React from 'react';
import { Progress, Typography } from 'antd';
import { useTheme } from 'styled-components';
import { Course, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseList } from 'types/courses';
import { badCourses, badValidations } from 'types/userResponse';
import { useCourseRatingQuery } from 'utils/apiHooks/static';
import { useUserCourses, useUserTermValidations } from 'utils/apiHooks/user';
import Collapsible from 'components/Collapsible';
import CourseTag from 'components/CourseTag';
import S from './styles';

const { Text } = Typography;

type CourseInfoDrawersProps = {
  course: Course;
  pathFrom?: CourseList;
  unlocked?: CoursesUnlockedWhenTaken;
  onCourseClick?: (code: string) => void;
};

const CourseInfoDrawers = ({
  course,
  onCourseClick,
  pathFrom = [],
  unlocked
}: CourseInfoDrawersProps) => {
  const courses = useUserCourses().data || badCourses;

  const pathFromInPlanner = pathFrom.filter((courseCode) =>
    Object.keys(courses).includes(courseCode)
  );
  const pathFromNotInPlanner = pathFrom.filter(
    (courseCode) => !Object.keys(courses).includes(courseCode)
  );
  const inPlanner = !!courses[course.code];
  const validateQuery = useUserTermValidations();
  const validations = validateQuery.data ?? badValidations;
  const isUnlocked = validations.courses_state[course.code];
  const ratingQuery = useCourseRatingQuery({}, course.code);
  const rating = ratingQuery.data;
  const theme = useTheme();

  return (
    <div className="course-info-drawers">
      <Collapsible title="Overview">
        <S.TextBlock>{course?.description ? course?.description : 'None'}</S.TextBlock>
        <h3>How students found the course:</h3>
        {rating ? (
          <S.RatingWrapper>
            <S.DialWrapper>
              <Progress
                type="dashboard"
                percent={rating.enjoyability ? (rating.enjoyability / 5) * 100 : 0}
                format={() => `${rating.enjoyability ? rating.enjoyability.toFixed(1) : '?'} / 5`}
                strokeColor={theme.purplePrimary}
                size={65}
              />
              <S.DialLabel>Enjoyability</S.DialLabel>
            </S.DialWrapper>
            <S.DialWrapper>
              <Progress
                type="dashboard"
                percent={rating.usefulness ? (rating.usefulness / 5) * 100 : 0}
                format={() => `${rating.usefulness ? rating.usefulness.toFixed(1) : '?'} / 5`}
                strokeColor={theme.purplePrimary}
                size={65}
              />
              <S.DialLabel>Usefulness</S.DialLabel>
            </S.DialWrapper>
            <S.DialWrapper>
              <Progress
                type="dashboard"
                percent={rating.manageability ? (rating.manageability / 5) * 100 : 0}
                format={() => `${rating.manageability ? rating.manageability.toFixed(1) : '?'} / 5`}
                strokeColor={theme.purplePrimary}
                size={65}
              />
              <S.DialLabel>Manageability</S.DialLabel>
            </S.DialWrapper>
          </S.RatingWrapper>
        ) : (
          <S.TextBlock>N/A</S.TextBlock>
        )}
      </Collapsible>
      <Collapsible title="Requirements">
        <S.TextBlock>{course?.raw_requirements ? course?.raw_requirements : 'None'}</S.TextBlock>
      </Collapsible>
      <Collapsible title="Course Prerequisites">
        {!!pathFrom.length && !isUnlocked ? (
          <>
            <S.TextBlock>
              These courses in your planner have helped unlocked this course:
              {!pathFromInPlanner.length && ' None'}
            </S.TextBlock>
            {!!pathFromInPlanner.length && (
              <S.TextBlock>
                {pathFromInPlanner.map((code) => (
                  <CourseTag key={code} onCourseClick={onCourseClick} name={code} />
                ))}
              </S.TextBlock>
            )}
            <S.TextBlock>
              You may need to complete these courses to unlock this course:
              {!pathFromNotInPlanner.length && <Text> None</Text>}
            </S.TextBlock>
            {!!pathFromNotInPlanner.length && (
              <S.TextBlock>
                {pathFromNotInPlanner.map((code) => (
                  <CourseTag key={code} onCourseClick={onCourseClick} name={code} />
                ))}
              </S.TextBlock>
            )}
          </>
        ) : (
          <S.TextBlock>
            {isUnlocked
              ? 'You have already unlocked this course.'
              : 'This course does not have any prerequisite that needs to be met.'}
          </S.TextBlock>
        )}
      </Collapsible>
      <Collapsible title="Courses unlocked after doing this course">
        {!!unlocked?.direct_unlock?.length && !inPlanner ? (
          <>
            <S.TextBlock>
              These courses are directly unlocked after completing this course:
            </S.TextBlock>
            <S.TextBlock>
              {unlocked.direct_unlock.map((code) => (
                <CourseTag key={`index-${code}`} name={code} onCourseClick={onCourseClick} />
              ))}
            </S.TextBlock>
          </>
        ) : (
          <S.TextBlock>
            {inPlanner
              ? "This course have already been added to your planner and hence can't unlock any more courses."
              : 'No courses will be unlocked after completing this course.'}
          </S.TextBlock>
        )}
      </Collapsible>
      <Collapsible title="Courses indirectly unlocked after doing this course" initiallyCollapsed>
        {!!unlocked?.indirect_unlock?.length && !inPlanner ? (
          <>
            <S.TextBlock>
              These courses are indirectly unlocked after completing this course:
            </S.TextBlock>
            <S.TextBlock>
              {unlocked.indirect_unlock.map((code) => (
                <CourseTag key={code} name={code} onCourseClick={onCourseClick} />
              ))}
            </S.TextBlock>
          </>
        ) : (
          <S.TextBlock>
            {inPlanner
              ? "This course have already been added to your planner and hence can't unlock any more courses."
              : 'No courses will be indirectly unlocked after completing this course.'}
          </S.TextBlock>
        )}
      </Collapsible>
    </div>
  );
};

export default CourseInfoDrawers;
