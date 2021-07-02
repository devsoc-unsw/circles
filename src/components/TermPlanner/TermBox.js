import React from "react";
import { Typography, Badge } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector } from "react-redux";

function TermBox({ name, courses, courseNames, termsOffered, isDragFinished }) {
  const term = name.match(/t[0-3]/)[0];
  let isDropDisabled = true;
  if (termsOffered.includes(term)) {
    isDropDisabled = false;
  }
  const theme = useSelector((state) => {
    return state.theme;
  });

  return (
    <Droppable droppableId={name} isDropDisabled={isDropDisabled}>
      {(provided, snapshot) => (
        <Badge
          offset={[-36, 36]}
          count={12}
          style={{
            fontSize: "1rem",
            width: "2em",
            height: "2em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: theme === "light" ? "#D170FF" : "#6E45FE",
            borderColor: theme === "light" ? "#D170FF" : "#6E45FE",
          }}
        >
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
        </Badge>
      )}
    </Droppable>
  );
}

export default TermBox;
