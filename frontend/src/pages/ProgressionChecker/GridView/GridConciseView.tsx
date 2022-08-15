import React from 'react';
import Typography from 'antd/lib/typography';
import { ViewSubgroupCourse } from 'types/progressionViews';
import Collapsible from 'components/Collapsible';
import { getNumTerms } from 'pages/TermPlanner/utils';
import CoursesSection from './CoursesSection';

type Props = {
  uoc: number
  subgroupKey: string
  courses: ViewSubgroupCourse[]
  isCoursesOverflow: boolean
};

const GridConciseView = ({
  uoc,
  subgroupKey,
  courses,
  isCoursesOverflow,
}: Props) => {
  const { Title } = Typography;

  const plannedCourses = courses.filter((c) => c.plannedFor);
  const unplannedCourses = courses.filter((c) => !c.plannedFor);
  const plannedUOC = plannedCourses.reduce(
    (sum, course) => (sum + ((course.UOC ?? 0) * getNumTerms((course.UOC ?? 0)))),
    0,
  );

  return (
    <>
      <Title level={2} className="text">{subgroupKey}</Title>
      <Title level={3} className="text">{uoc} UOC of the following courses</Title>
      {!!courses.length && (
        <>
          <Collapsible
            title={<Title level={4} className="text">You have {plannedUOC} UOC worth of courses planned</Title>}
            headerStyle={{ border: 'none' }}
            initiallyCollapsed={!plannedCourses.length}
          >
            <CoursesSection
              title={subgroupKey}
              plannedCourses={plannedCourses}
              unplannedCourses={[]}
            />
          </Collapsible>
          <Collapsible
            title={<Title level={4} className="text">Choose {Math.max(uoc - plannedUOC, 0)} UOC from the following courses</Title>}
            headerStyle={{ border: 'none' }}
            initiallyCollapsed={
              !isCoursesOverflow && (unplannedCourses.length > 16 || !unplannedCourses.length)
            }
          >
            <CoursesSection
              title={subgroupKey}
              isCoursesOverflow={isCoursesOverflow}
              plannedCourses={[]}
              unplannedCourses={unplannedCourses}
            />
          </Collapsible>
        </>
      )}
    </>
  );
};

export default GridConciseView;
