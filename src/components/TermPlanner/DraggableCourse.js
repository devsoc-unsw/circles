import React from "react";
import { Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function DraggableCourse({ code, index, courseNames }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Title, Text } = Typography;
  const course = courseNames[code];

  return (
    <Draggable draggableId={code} index={index}>
      {(provided) => (
        <li
          className="course"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Text strong style={{ color: "white" }}>
            {code}
          </Text>
          <Text style={{ color: "white" }}>: {course} </Text>
        </li>
      )}
    </Draggable>
  );
}

export default DraggableCourse;
