import React from "react";
import { Typography, Badge } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector } from "react-redux";

function TermBox({ name, courses, courseNames, termsOffered, isDragging }) {
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
            <DraggableCourse
              key={code}
              code={code}
              index={index}
              courseNames={courseNames}
            />
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}

export default TermBox;
