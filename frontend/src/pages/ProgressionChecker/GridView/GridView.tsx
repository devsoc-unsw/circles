import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import { sortByAlphaNumeric, sortByLevel, SortFn } from '../sortUtils';
import CoursesSection from './CoursesSection';
import GridConciseView from './GridConciseView';

type Props = {
  subgroupTitle: string
  courses: ViewSubgroupCourse[]
  uoc: number
  isCoursesOverflow: boolean
  isConcise: boolean
};

const GridView = ({
  subgroupTitle,
  courses,
  uoc,
  isCoursesOverflow,
  isConcise,
}: Props) => {
  const { Title } = Typography;

  const plannedUOC = courses
    .filter((course) => course.plannedFor)
    .reduce(
      (sum, course) => (sum + ((course.UOC ?? 0)
        * getNumTerms((course.UOC ?? 0), course.isMultiterm))),
      0,
    );

  const plannedCourses = courses.filter((c) => c.plannedFor);
  const unplannedCourses = courses.filter((c) => !c.plannedFor);

  const [sortFn, setSortFn] = useState(SortFn.AlphaNumeric);

  if (isConcise) {
    return (
      <GridConciseView
        uoc={uoc}
        subgroupKey={subgroupTitle}
        courses={courses}
        isCoursesOverflow={isCoursesOverflow}
      />
    );
  }

  return (
    <>
      <Title level={2} className="text">{subgroupTitle}</Title>
      <div>
        <Title level={3} className="text">{uoc} UOC of the following courses ({Math.max(uoc - plannedUOC, 0)} UOC remaining)</Title>
        <div>
          <Button onClick={() => setSortFn(SortFn.AlphaNumeric)}>Sort By AlphaNumeric</Button>
          <Button onClick={() => setSortFn(SortFn.Level)}>Sort By Level</Button>
        </div>
      </div>
      <CoursesSection
        title={subgroupTitle}
        isCoursesOverflow={isCoursesOverflow}
        plannedCourses={plannedCourses}
        unplannedCourses={unplannedCourses}
        sortFn={sortFn === SortFn.AlphaNumeric ? sortByAlphaNumeric : sortByLevel}
      />
    </>
  );
};

export default GridView;
