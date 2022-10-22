import React from 'react';
import { useSelector } from 'react-redux';
import { CourseList } from 'types/courses';
import { APICourse, APICoursesUnlockedWhenTaken } from 'utils/api/types/responses';
import Collapsible from 'components/Collapsible';
import CourseTag from 'components/CourseTag';
import PrerequisiteTree from 'components/PrerequisiteTree';
import { inDev } from 'config/constants';
import type { RootState } from 'config/store';

type CourseInfoDrawersProps = {
  course: APICourse;
  pathFrom?: CourseList;
  unlocked?: APICoursesUnlockedWhenTaken;
  onCourseClick?: (code: string) => void;
};

const CourseInfoDrawers = ({
  course,
  onCourseClick,
  pathFrom,
  unlocked
}: CourseInfoDrawersProps) => {
  const planner = useSelector((state: RootState) => state.planner);

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
                  <CourseTag key={courseCode} onCourseClick={onCourseClick} name={courseCode} />
                ))
            : 'None'}
        </p>
      </Collapsible>
      <Collapsible title="Doing this course will directly unlock these courses" initiallyCollapsed>
        <p>
          {unlocked?.direct_unlock && unlocked.direct_unlock.length > 0
            ? unlocked.direct_unlock.map((courseCode) => (
                <CourseTag key={courseCode} onCourseClick={onCourseClick} name={courseCode} />
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
            ? unlocked.indirect_unlock.map((code) => (
                <CourseTag key={code} name={code} onCourseClick={onCourseClick} />
              ))
            : 'None'}
        </p>
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
