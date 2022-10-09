import React, { FunctionComponent, MouseEventHandler } from 'react';
import { Course, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseList } from 'types/courses';
import Collapsible from 'components/Collapsible';
import CourseTagStandard from 'components/CourseTag';
import PrerequisiteTree from 'components/PrerequisiteTree';
import { PlannerSliceState } from 'reducers/plannerSlice';
import S from './styles';

type CourseTagProps = {
  name: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
};

const CourseTagGraphical = ({ name, onClick }: CourseTagProps) => (
  (onClick !== undefined)
    ? <S.Tag className="text clickable" onClick={onClick}>{name}</S.Tag>
    : <S.Tag className="text">{name}</S.Tag>
);

interface CourseInfoDrawersProps {
  course: Course;
  pathFrom?: CourseList;
  unlocked?: CoursesUnlockedWhenTaken;

  prereqVis: boolean;
  planner: PlannerSliceState;
  onCourseClick?: (code: string) => void;
}

const CourseInfoDrawers: FunctionComponent<CourseInfoDrawersProps> = ({
  course, onCourseClick, pathFrom, prereqVis, planner, unlocked,
}) => {
  // figure out a better way to do this
  // difficult because classic CourseTag uses dispatches, where as CourseTagGraphical doesn't
  const CourseTag = prereqVis ? CourseTagStandard : CourseTagGraphical;

  return (
    <div>
      <Collapsible title="Overview">
        <p>{course.description}</p>
      </Collapsible>
      <Collapsible title="Requirements" initiallyCollapsed>
        <p>{course.raw_requirements}</p>
      </Collapsible>
      <Collapsible title="Courses you have done to unlock this course" initiallyCollapsed>
        <p>
          {pathFrom && pathFrom.length > 0 ? (
            pathFrom
              .filter((code) => Object.keys(planner.courses).includes(code))
              .map((code) => (
                onCourseClick
                  ? (
                    <CourseTag
                      key={code}
                      name={code}
                      onClick={() => { onCourseClick(code); }}
                    />
                  )
                  : <CourseTag key={code} name={code} />
              ))
          ) : 'None'}
        </p>
      </Collapsible>
      <Collapsible title="Doing this course will directly unlock these courses" initiallyCollapsed>
        <p>
          {unlocked?.direct_unlock && unlocked.direct_unlock.length > 0 ? (
            unlocked.direct_unlock.map((code) => (
              onCourseClick
                ? (
                  <CourseTag
                    key={code}
                    name={code}
                    onClick={() => { onCourseClick(code); }}
                  />
                )
                : <CourseTag key={code} name={code} />
            ))
          ) : 'None'}
        </p>
      </Collapsible>
      <Collapsible title="Doing this course will indirectly unlock these courses" initiallyCollapsed>
        <p>
          {unlocked?.indirect_unlock && unlocked.indirect_unlock.length > 0 ? (
            unlocked.indirect_unlock.map((code) => (
              onCourseClick
                ? (
                  <CourseTag
                    key={code}
                    name={code}
                    onClick={() => { onCourseClick(code); }}
                  />
                )
                : <CourseTag key={code} name={code} />
            ))
          ) : 'None'}
        </p>
      </Collapsible>
      {prereqVis && (
      <Collapsible title="Prerequisite Visualisation">
        <PrerequisiteTree courseCode={course.code} />
      </Collapsible>
      )}
    </div>
  );
};

export default CourseInfoDrawers;
