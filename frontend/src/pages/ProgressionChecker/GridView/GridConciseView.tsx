import React, { useState } from 'react';
import { FaSortAlphaDown, FaSortNumericDown } from 'react-icons/fa';
import { Tooltip, Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import { sortByAlphaNumeric, sortByLevel, SortFn } from 'utils/sortCourses';
import Collapsible from 'components/Collapsible';
import { COURSES_INITIALLY_COLLAPSED } from 'config/constants';
import CoursesSection from './CoursesSection';
import S from './styles';

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
      <S.TitleSortWrapper>
        <Title level={3} className="text">{uoc} UOC of the following courses</Title>
        <S.SortBtnWrapper>
          <Tooltip title="Sort by Alphabet">
            <FaSortAlphaDown color={sortFn === SortFn.AlphaNumeric ? '#9254de' : undefined} onClick={() => setSortFn(SortFn.AlphaNumeric)} />
          </Tooltip>
          <Tooltip title="Sort by Course Level">
            <FaSortNumericDown color={sortFn === SortFn.Level ? '#9254de' : undefined} onClick={() => setSortFn(SortFn.Level)} />
          </Tooltip>
        </S.SortBtnWrapper>
      </S.TitleSortWrapper>
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
              && (unplannedCourses.length > COURSES_INITIALLY_COLLAPSED
                || !unplannedCourses.length))
            }
          >
            <CoursesSection
              title={subgroupKey}
              isCoursesOverflow={isCoursesOverflow}
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
