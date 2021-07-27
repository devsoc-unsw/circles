import React from "react";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";

function TermBox({ name, courses, termsOffered, isDragging }) {
  const term = name.match(/t[0-3]/)[0];
  const isDropAllowed = termsOffered.includes(term);

  return (
    <Droppable droppableId={name} isDropDisabled={!isDropAllowed}>
      {(provided) => (
        <ul
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`termBox ${isDropAllowed && isDragging && "droppable"}  `}
        >
          {courses.map((code, index) => (
            <DraggableCourse key={code} code={code} index={index} />
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}

export default TermBox;
