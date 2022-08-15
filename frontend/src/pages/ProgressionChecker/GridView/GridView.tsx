import React from 'react';
import Typography from 'antd/lib/typography';
import { ViewSubgroupCourse } from 'types/progressionViews';
import { getNumTerms } from 'pages/TermPlanner/utils';
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
      (sum, course) => (sum + ((course.UOC ?? 0) * getNumTerms((course.UOC ?? 0)))),
      0,
    );

  const plannedCourses = courses.filter((c) => c.plannedFor);
  const unplannedCourses = courses.filter((c) => !c.plannedFor);

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
      <Title level={3} className="text">{uoc} UOC of the following courses ({Math.max(uoc - plannedUOC, 0)} UOC remaining)</Title>
      <CoursesSection
        title={subgroupTitle}
        isCoursesOverflow={isCoursesOverflow}
        plannedCourses={plannedCourses}
        unplannedCourses={unplannedCourses}
      />
    </>
  );
};

export default GridView;
