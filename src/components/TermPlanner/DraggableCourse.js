import React from "react";
import { Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function DraggableCourse({ course, index }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Title, Text } = Typography;
  return (
    <Draggable key={course} draggableId={course} index={index}>
      {(provided) => (
        <li
          className="course"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          {course}
        </li>
      )}
    </Draggable>
  );
}

export default DraggableCourse;
