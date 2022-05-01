import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import DraggableCourse from "./DraggableCourse";

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }

const UnplannedColumn = ({ isDragging }) => {
  const { isSummerEnabled, unplanned } = useSelector((state) => state.planner);

  return (
    <Droppable droppableId="unplanned">
      {(provided) => (
        <ul
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`unplannedBox ${isDragging && "droppable "} ${isSummerEnabled && "summerUnplannedBox"}`}
        >
          {unplanned.map((course, courseIndex) => (
            <DraggableCourse
              code={course}
              index={courseIndex}
              key={course}
            />
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
};

export default UnplannedColumn;
