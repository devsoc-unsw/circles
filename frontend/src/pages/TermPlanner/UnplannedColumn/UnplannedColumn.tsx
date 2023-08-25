import React, { Suspense } from 'react';
import { useQuery } from 'react-query';
import { badPlanner, PlannerResponse } from 'types/userResponse';
import { getCourseInfo } from 'utils/api/courseApi';
import { getUserPlanner } from 'utils/api/userApi';
import Spinner from 'components/Spinner';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

type Props = {
  dragging: boolean;
};

const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

const UnplannedColumn = ({ dragging }: Props) => {
  const plannerQuery = useQuery('planner', getUserPlanner);
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;
  const { unplanned, isSummerEnabled } = planner;

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
                  course={getCourseInfo(courseCode)} // TODO: How to await this within react component?
                  index={courseIndex}
                  term=""
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
