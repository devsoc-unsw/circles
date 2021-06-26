import React from "react";
import { Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function DraggableCourse({ code, index, courseNames }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Title, Text } = Typography;
  const course = courseNames[code]["title"];

  return (
    <Draggable draggableId={code} index={index}>
      {(provided, snapshot) => (
        <li
          className="course"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            backgroundColor: snapshot.isDragging && "#be7df2",
            ...provided.draggableProps.style,
          }}
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
