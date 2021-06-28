import React from "react";
import { Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";

function DraggableCourse({ code, index, courseNames }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Title, Text } = Typography;
  const course = courseNames[code]["title"];

  const theme = useSelector((state) => {
    return state.theme;
  });

  let color = "#bfbfbf";
  if (theme === "dark") {
    color = "#7A40C2";
  }

  return (
    <Draggable draggableId={code} index={index}>
      {(provided, snapshot) => (
        <li
          className="course"
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            backgroundColor: snapshot.isDragging && color,
            ...provided.draggableProps.style,
          }}
        >
          <Text strong className="text">
            {code}
          </Text>
          <Text className="text">: {course} </Text>
        </li>
      )}
    </Draggable>
  );
}

export default DraggableCourse;
