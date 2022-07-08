import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import useMediaQuery from "react-responsive";
import DraggableCourse from "../DraggableCourse";
import S from "./styles";

const UnplannedColumn = ({ dragging }) => {
  const { isSummerEnabled, unplanned } = useSelector((state) => state.planner);
  const isSmall = useMediaQuery({ maxWidth: 1400 });

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
