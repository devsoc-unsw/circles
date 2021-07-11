import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";

function DraggableCourse({ code, index, courseNames }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Text } = Typography;
  const courseName = courseNames[code]["title"];

  return (
    <Draggable draggableId={code} index={index}>
      {(provided) => (
        <li
          className="course"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          <Text strong className="text">
            {code}
          </Text>
          <Text className="text">: {courseName} </Text>
        </li>
      )}
    </Draggable>
  );
}

export default DraggableCourse;
