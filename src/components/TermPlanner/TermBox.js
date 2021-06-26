import React from "react";
import { Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";

function TermBox({ name, courses, courseNames, termsOffered, isDragFinished }) {
  const term = name.match(/t[0-3]/)[0];
  let isDropDisabled = true;
  if (termsOffered.includes(term)) {
    isDropDisabled = false;
  }

  return (
    <Droppable droppableId={name} isDropDisabled={isDropDisabled}>
      {(provided, snapshot) => (
        <ul
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={
            !isDropDisabled && !isDragFinished
              ? "droppable termBubble"
              : "termBubble"
          }
        >
          {courses.map((course, index) => (
            <DraggableCourse
              code={course}
              index={index}
              courseNames={courseNames}
              key={course}
            />
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}

export default TermBox;
