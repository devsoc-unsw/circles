import React, { FunctionComponent } from 'react';
import { Course, CoursesUnlockedWhenTaken } from 'types/api';
import { CourseList } from 'types/courses';
import Collapsible from 'components/Collapsible';
import PrerequisiteTree from 'components/PrerequisiteTree';
import { PlannerSliceState } from 'reducers/plannerSlice';
import GraphicalCourseTag from './GraphicalCourseTag';

interface CourseInfoDrawersProps {
  course: Course;
  pathFrom: CourseList;
  unlocked: CoursesUnlockedWhenTaken;
  prereqVis: boolean;
  planner: PlannerSliceState;
  onCourseClick?: (code: string) => void;
}

const CourseInfoDrawers: FunctionComponent<CourseInfoDrawersProps> = ({
  course, onCourseClick, pathFrom, prereqVis, planner, unlocked,
}) => (
  <>
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
                  <GraphicalCourseTag
                    key={code}
                    name={code}
                    onClick={() => { onCourseClick(code); }}
                  />
                )
                : <GraphicalCourseTag key={code} name={code} />
            ))
        ) : 'None'}
      </p>
    </Collapsible>
    <Collapsible title="Doing this course will directly unlock these courses" initiallyCollapsed>
      <p>
        {unlocked.direct_unlock && unlocked.direct_unlock.length > 0 ? (
          unlocked.direct_unlock.map((code) => (
            onCourseClick
              ? (
                <GraphicalCourseTag
                  key={code}
                  name={code}
                  onClick={() => { onCourseClick(code); }}
                />
              )
              : <GraphicalCourseTag key={code} name={code} />
          ))
        ) : 'None'}
      </p>
    </Collapsible>
    <Collapsible title="Doing this course will indirectly unlock these courses" initiallyCollapsed>
      <p>
        {unlocked.indirect_unlock && unlocked.indirect_unlock.length > 0 ? (
          unlocked.indirect_unlock.map((code) => (
            onCourseClick
              ? (
                <GraphicalCourseTag
                  key={code}
                  name={code}
                  onClick={() => { onCourseClick(code); }}
                />
              )
              : <GraphicalCourseTag key={code} name={code} />
          ))
        ) : 'None'}
      </p>
    </Collapsible>
    {prereqVis && (
    <Collapsible title="Prerequisite Visualisation">
      <PrerequisiteTree courseCode={course.code} />
    </Collapsible>
    )}
  </>
);

export default CourseInfoDrawers;
