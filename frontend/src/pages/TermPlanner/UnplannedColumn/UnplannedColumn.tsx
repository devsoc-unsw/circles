import React, { Suspense } from 'react';
import { useQuery } from 'react-query';
import { Course } from 'types/api';
import { badCourses, badPlanner, CoursesResponse, PlannerResponse } from 'types/userResponse';
import { getUserCourses, getUserPlanner } from 'utils/api/userApi';
import Spinner from 'components/Spinner';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

type Props = {
  dragging: boolean;
  courseInfos: Record<string, Course>;
};

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

/* eslint-disable */

const UnplannedColumn = ({ dragging, courseInfos }: Props) => {
  const plannerQuery = useQuery('planner', getUserPlanner);
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;
  const { unplanned, isSummerEnabled } = planner;

  const coursesQuery = useQuery('courses', getUserCourses);
  const courses: CoursesResponse = coursesQuery.data ?? badCourses;

  const isSmall = useMediaQuery('(max-width: 1400px)');

  return (
    <S.UnplannedContainer summerEnabled={isSummerEnabled}>
      <S.UnplannedTitle>Unplanned</S.UnplannedTitle>
      <Suspense fallback={<Spinner text="Loading unplanned column..." />}>
        <Droppable droppableId="unplanned">
          {(provided) => (
            <S.UnplannedBox
              ref={provided.innerRef}
              {...provided.droppableProps}
              summerEnabled={isSummerEnabled}
              droppable={dragging}
              isSmall={isSmall}
            >
              {unplanned.map((courseCode, courseIndex) => (
                <DraggableCourse
                  planner={planner}
                  courses={courses}
                  courseInfo={courseInfos[courseCode]}
                  index={courseIndex}
                  time={undefined}
                />
              ))}
              {provided.placeholder}
            </S.UnplannedBox>
          )}
        </Droppable>
      </Suspense>
    </S.UnplannedContainer>
  );
};

export default UnplannedColumn;
