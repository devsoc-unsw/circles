import React, { Suspense } from 'react';
import { Course } from 'types/api';
import {
  badCourses,
  badPlanner,
  CoursesResponse,
  PlannerResponse,
  ValidateResponse
} from 'types/userResponse';
import { useUserCourses, useUserPlanner } from 'utils/apiHooks/user';
import Spinner from 'components/Spinner';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

type Props = {
  dragging: boolean;
  courseInfos: Record<string, Course>;
  validateInfos: Record<string, ValidateResponse>;
  // Omitted by the mobile view, which lays this out with flex instead of the grid
  colStart?: number; // First grid column after the term columns
  colSpan?: number; // Matches the width of one term of the longest year
};

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

const UnplannedColumn = ({ dragging, courseInfos, validateInfos, colStart, colSpan }: Props) => {
  const plannerQuery = useUserPlanner();
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;
  const { unplanned, isSummerEnabled } = planner;

  const coursesQuery = useUserCourses();
  const courses: CoursesResponse = coursesQuery.data ?? badCourses;

  const isSmall = useMediaQuery('(max-width: 1400px)');

  return (
    <S.UnplannedContainer $colStart={colStart} $colSpan={colSpan}>
      <S.UnplannedTitle>Unplanned</S.UnplannedTitle>
      <Suspense fallback={<Spinner text="Loading unplanned column..." />}>
        <Droppable droppableId="unplanned">
          {(provided) => (
            <S.UnplannedBox
              ref={provided.innerRef}
              {...provided.droppableProps}
              $summerEnabled={isSummerEnabled}
              $droppable={dragging}
              $isSmall={isSmall}
            >
              {unplanned.map((courseCode, courseIndex) => {
                const info = courseInfos[courseCode];
                if (!info) return null;
                return (
                  <DraggableCourse
                    key={courseCode}
                    planner={planner}
                    courses={courses}
                    validate={validateInfos[courseCode]}
                    courseInfo={info}
                    index={courseIndex}
                    time={undefined}
                  />
                );
              })}
              {provided.placeholder}
            </S.UnplannedBox>
          )}
        </Droppable>
      </Suspense>
    </S.UnplannedContainer>
  );
};

export default UnplannedColumn;
