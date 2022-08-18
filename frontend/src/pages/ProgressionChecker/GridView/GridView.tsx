import React, { useState } from 'react';
import { FaSortAlphaDown, FaSortNumericDown } from 'react-icons/fa';
import { Tooltip, Typography } from 'antd';
import { ViewSubgroupCourse } from 'types/progressionViews';
import getNumTerms from 'utils/getNumTerms';
import { sortByAlphaNumeric, sortByLevel, SortFn } from 'utils/sortCourses';
import CoursesSection from './CoursesSection';
import GridConciseView from './GridConciseView';
import S from './styles';

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
      <S.TitleSortWrapper>
        <Title level={3} className="text">{uoc} UOC of the following courses ({Math.max(uoc - plannedUOC, 0)} UOC remaining)</Title>
        <S.SortBtnWrapper>
          <Tooltip title="Sort by Alphabet">
            <FaSortAlphaDown color={sortFn === SortFn.AlphaNumeric ? '#9254de' : undefined} onClick={() => setSortFn(SortFn.AlphaNumeric)} />
          </Tooltip>
          <Tooltip title="Sort by Course Level">
            <FaSortNumericDown color={sortFn === SortFn.Level ? '#9254de' : undefined} onClick={() => setSortFn(SortFn.Level)} />
          </Tooltip>
        </S.SortBtnWrapper>
      </S.TitleSortWrapper>
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
