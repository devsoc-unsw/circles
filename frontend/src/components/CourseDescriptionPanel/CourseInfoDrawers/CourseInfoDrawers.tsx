import React, { MouseEventHandler } from 'react';
import { Course, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseList } from 'types/courses';
import Collapsible from 'components/Collapsible';
import CourseTagStandard from 'components/CourseTag';
import PrerequisiteTree from 'components/PrerequisiteTree';
import { inDev } from 'config/constants';
import { PlannerSliceState } from 'reducers/plannerSlice';
import S from './styles';

type CourseTagProps = {
  name: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
};

const CourseTagGraphical = ({ name, onClick }: CourseTagProps) =>
  onClick !== undefined ? (
    <S.Tag className="text clickable" onClick={onClick}>
      {name}
    </S.Tag>
  ) : (
    <S.Tag className="text">{name}</S.Tag>
  );

type CourseInfoDrawersProps = {
  course: Course;
  pathFrom?: CourseList;
  unlocked?: CoursesUnlockedWhenTaken;
  prereqVis: boolean;
  planner: PlannerSliceState;
  onCourseClick?: (code: string) => void;
};

const CourseInfoDrawers = ({
  course,
  onCourseClick,
  pathFrom,
  prereqVis,
  planner,
  unlocked
}: CourseInfoDrawersProps) => {
  // figure out a better way to do this
  // difficult because classic CourseTag uses dispatches, where as CourseTagGraphical doesn't
  const CourseTag = prereqVis ? CourseTagStandard : CourseTagGraphical;

  return (
    <div>
      <Collapsible title="Overview">
        {/* eslint-disable-next-line react/no-danger */}
        <p dangerouslySetInnerHTML={{ __html: course?.description || 'None' }} />
      </Collapsible>
      <Collapsible title="Requirements" initiallyCollapsed>
        {/* eslint-disable-next-line react/no-danger */}
        <p dangerouslySetInnerHTML={{ __html: course?.raw_requirements || 'None' }} />
      </Collapsible>
      <Collapsible title="Courses you have done to unlock this course" initiallyCollapsed>
        <p>
          {pathFrom && pathFrom.length > 0
            ? pathFrom
                .filter((courseCode) => Object.keys(planner.courses).includes(courseCode))
                .map((courseCode) => (
                  <CourseTag
                    key={courseCode}
                    onClick={() => onCourseClick && onCourseClick(courseCode)}
                    name={courseCode}
                  />
                ))
            : 'None'}
        </p>
      </Collapsible>
      <Collapsible title="Doing this course will directly unlock these courses" initiallyCollapsed>
        <p>
          {unlocked?.direct_unlock && unlocked.direct_unlock.length > 0
            ? unlocked.direct_unlock.map((courseCode) => (
                <CourseTag
                  key={courseCode}
                  onClick={() => onCourseClick && onCourseClick(courseCode)}
                  name={courseCode}
                />
              ))
            : 'None'}
        </p>
      </Collapsible>
      <Collapsible
        title="Doing this course will indirectly unlock these courses"
        initiallyCollapsed
      >
        <p>
          {unlocked?.indirect_unlock && unlocked.indirect_unlock.length > 0
            ? unlocked.indirect_unlock.map((code) =>
                onCourseClick ? (
                  <CourseTag
                    key={code}
                    name={code}
                    onClick={() => {
                      onCourseClick(code);
                    }}
                  />
                ) : (
                  <CourseTag key={code} name={code} />
                )
              )
            : 'None'}
        </p>
      </Collapsible>
      {inDev && (
        <Collapsible title="Prerequisite Visualisation">
          <PrerequisiteTree courseCode={course.code} />
        </Collapsible>
      )}
    </div>
  );
};

export default CourseInfoDrawers;
