import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

type Props = {
  dragging: boolean
};

const Droppable = React.lazy(() => import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable })));

const UnplannedColumn = ({ dragging }: Props) => {
  const { isSummerEnabled, unplanned } = useSelector((state: RootState) => state.planner);
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
              {unplanned.map((course, courseIndex) => (
                <DraggableCourse
                  code={course}
                  index={courseIndex}
                  key={course}
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
