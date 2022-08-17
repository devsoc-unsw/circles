import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import Collapsible from 'components/Collapsible';
import { sortByAlphaNumeric, sortByLevel, SortFn } from '../sortUtils';
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

  const [sortFn, setSortFn] = useState(SortFn.AlphaNumeric);

  const plannedCourses = courses.filter((c) => c.plannedFor);
  const unplannedCourses = courses.filter((c) => !c.plannedFor);
  const plannedUOC = plannedCourses.reduce(
    (sum, course) => (sum + ((course.UOC ?? 0)
      * getNumTerms((course.UOC ?? 0), course.isMultiterm))),
    0,
  );
  const remainingUOC = Math.max(uoc - plannedUOC, 0);

  return (
    <>
      <Title level={2} className="text">{subgroupKey}</Title>
      <div>
        <Title level={3} className="text">{uoc} UOC of the following courses</Title>
        <div>
          <Button onClick={() => setSortFn(SortFn.AlphaNumeric)}>Sort By AlphaNumeric</Button>
          <Button onClick={() => setSortFn(SortFn.Level)}>Sort By Level</Button>
        </div>
      </div>
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
              sortFn={sortFn === SortFn.AlphaNumeric ? sortByAlphaNumeric : sortByLevel}
            />
          </Collapsible>
          <Collapsible
            title={<Title level={4} className="text">Choose {remainingUOC} UOC from the following courses</Title>}
            headerStyle={{ border: 'none' }}
            initiallyCollapsed={
              !remainingUOC
              || (!isCoursesOverflow
              && (unplannedCourses.length > 16 || !unplannedCourses.length))
            }
          >
            <CoursesSection
              title={subgroupKey}
              isCoursesOverflow={false}
              plannedCourses={[]}
              unplannedCourses={unplannedCourses}
              sortFn={sortFn === SortFn.AlphaNumeric ? sortByAlphaNumeric : sortByLevel}
            />
          </Collapsible>
        </>
      )}
    </>
  );
};

export default GridConciseView;
