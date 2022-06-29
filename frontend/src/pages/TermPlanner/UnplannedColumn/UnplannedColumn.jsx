import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import useMediaQuery from "hooks/useMediaQuery";
import DraggableCourse from "../DraggableCourse";
import S from "./styles";

const UnplannedColumn = ({ isDragging }) => {
  const { isSummerEnabled, unplanned } = useSelector((state) => state.planner);
  const isSmall = useMediaQuery("(max-width: 1400px)");

  return (
    <S.UnplannedContainer summerEnabled={isSummerEnabled}>
      <S.UnplannedTitle>Unplanned</S.UnplannedTitle>
      <Droppable droppableId="unplanned">
        {(provided) => (
          <S.UnplannedBox
            ref={provided.innerRef}
            {...provided.droppableProps}
            summerEnabled={isSummerEnabled}
            droppable={isDragging}
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
