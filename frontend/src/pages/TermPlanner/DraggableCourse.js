import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { IoWarningOutline } from "react-icons/io5";

function DraggableCourse({ code, index, warning }) {
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
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          style={{
            ...provided.draggableProps.style,
          }}
          className={`course ${warning && "warning"}`}
        >
          {warning && <IoWarningOutline size="2.5em" color="#DC9930" />}
          <div>
            <Text strong className="text">
              {code}
            </Text>
            <Text className="text">: {courseName} </Text>
          </div>
        </li>
      )}
    </Draggable>
  );
}

export default DraggableCourse;
