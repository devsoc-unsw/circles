import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { useSelector } from 'react-redux';
import type { RootState } from 'config/store';
import useMediaQuery from 'hooks/useMediaQuery';
import DraggableCourse from '../DraggableCourse';
import S from './styles';

type Props = {
  dragging: boolean
};

const UnplannedColumn = ({ dragging }: Props) => {
  const { isSummerEnabled, unplanned } = useSelector((state: RootState) => state.planner);
  const isSmall = useMediaQuery('(max-width: 1400px)');

  return (
    <S.UnplannedContainer summerEnabled={isSummerEnabled}>
      <S.UnplannedTitle>Unplanned</S.UnplannedTitle>
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
    </S.UnplannedContainer>
  );
};

export default UnplannedColumn;
