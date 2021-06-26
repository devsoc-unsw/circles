import React from "react";
import { Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";

function TermBox({ name, courses, courseNames }) {
  return (
    <Droppable droppableId={name}>
      {(provided) => (
        <ul
          class="termBubble"
          ref={provided.innerRef}
          {...provided.droppableProps}
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
