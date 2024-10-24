import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Course } from 'types/api';
import {
  badCourses,
  badPlanner,
  CoursesResponse,
  PlannerResponse,
  ValidateResponse
} from 'types/userResponse';
import { getUserCourses, getUserPlanner } from 'utils/api/userApi';
import Spinner from 'components/Spinner';
import useMediaQuery from 'hooks/useMediaQuery';
import useToken from 'hooks/useToken';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

type Props = {
  dragging: boolean;
  courseInfos: Record<string, Course>;
  validateInfos: Record<string, ValidateResponse>;
};

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

const UnplannedColumn = ({ dragging, courseInfos, validateInfos }: Props) => {
  const token = useToken();
  const plannerQuery = useQuery({
    queryKey: ['planner'],
    queryFn: () => getUserPlanner(token)
  });
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;
  const { unplanned, isSummerEnabled } = planner;

  const coursesQuery = useQuery({
    queryKey: ['courses'],
    queryFn: () => getUserCourses(token)
  });
  const courses: CoursesResponse = coursesQuery.data ?? badCourses;

  const isSmall = useMediaQuery('(max-width: 1400px)');

  return (
    <S.UnplannedContainer $summerEnabled={isSummerEnabled}>
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
              {unplanned.map((courseCode, courseIndex) => (
                <DraggableCourse
                  key={courseCode}
                  planner={planner}
                  courses={courses}
                  validate={validateInfos[courseCode]}
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
