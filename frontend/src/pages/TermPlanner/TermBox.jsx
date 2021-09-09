import React from "react";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector } from "react-redux";

function TermBox({ name, courses, termsOffered, isDragging }) {
  const term = name.match(/t[0-3]/)[0];
  const isDropAllowed = termsOffered.includes(term);

  const { isSummerEnabled } = useSelector((state) => {
    return state.planner;
  });

  return (
    <Droppable droppableId={name} isDropDisabled={!isDropAllowed}>
      {(provided) => (
        <ul
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`termBox ${isDropAllowed && isDragging && "droppable "} ${
            isSummerEnabled && "summerTermBox"
          }`}
        >
          {courses.map((code, index) => {
            // const warning = courses.get(code)["warning"];
            return (
              <DraggableCourse
                key={code}
                code={code}
                index={index}
                // warning={warning}
              />
            );
          })}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}

export default TermBox;
