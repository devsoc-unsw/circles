import React from "react";
import { Typography, Badge } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector } from "react-redux";

function TermBox({ name, courses, courseNames, termsOffered, isDragging }) {
  const term = name.match(/t[0-3]/)[0];
  const isDropAllowed = termsOffered.includes(term);
  const theme = useSelector((state) => {
    return state.theme;
  });

  const badgeStyle = {
    fontSize: "1rem",
    width: "2em",
    height: "2em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme === "light" ? "#D170FF" : "#9B53E5",
    borderColor: theme === "light" ? "#D170FF" : "#9B53E5",
  };

  return (
    <Droppable droppableId={name} isDropDisabled={!isDropAllowed}>
      {(provided) => (
        // <Badge offset={[-30, 30]} count={12} style={badgeStyle}>
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
        // </Badge>
      )}
    </Droppable>
  );
}

export default TermBox;
