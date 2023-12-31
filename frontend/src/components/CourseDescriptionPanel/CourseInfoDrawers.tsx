import React from 'react';
import { useSelector } from 'react-redux';
import { Typography } from 'antd';
import { Course, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseList } from 'types/courses';
import Collapsible from 'components/Collapsible';
import CourseTag from 'components/CourseTag';
import PrerequisiteTree from 'components/PrerequisiteTree';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';
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
  const { planner, courses } = useSelector((state: RootState) => state);

  const pathFromInPlanner = pathFrom.filter((courseCode) =>
    Object.keys(planner.courses).includes(courseCode)
  );
  const pathFromNotInPlanner = pathFrom.filter(
    (courseCode) => !Object.keys(planner.courses).includes(courseCode)
  );
  const isUnlocked = courses.courses[course.code]?.unlocked;
  const inPlanner = planner.courses[course.code];

  return (
    <div className="course-info-drawers">
      <Collapsible title="Overview">
        <S.TextBlock>{course?.description ? course?.description : 'None'}</S.TextBlock>
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
                <CourseTag key={code} name={code} onCourseClick={onCourseClick} />
              ))}
            </S.TextBlock>
          </>
        ) : (
          <S.TextBlock>
            {inPlanner
              ? "This course have already been added to your planner and hence can't unlock anymore courses."
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
              ? "This course have already been added to your planner and hence can't unlock anymore courses."
              : 'No courses will be indirectly unlocked after completing this course.'}
          </S.TextBlock>
        )}
      </Collapsible>
      {inDev && (
        <Collapsible title="Prerequisite Visualisation">
          <PrerequisiteTree courseCode={course.code} onCourseClick={onCourseClick} />
        </Collapsible>
      )}
    </div>
  );
};

export default CourseInfoDrawers;
