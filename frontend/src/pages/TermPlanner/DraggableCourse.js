import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";

function DraggableCourse({ code, index }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Text } = Typography;
  const { courses } = useSelector((state) => {
    return state.planner;
  });
  const courseName = courses.get(code)["title"];

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
