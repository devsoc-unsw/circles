import React, { useEffect, useState } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import DraggableCourse from "../DraggableCourse";
import "./index.less";

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }

const UnplannedColumn = ({ isDragging, unplannedRef }) => {
  const { isSummerEnabled, unplanned } = useSelector((state) => state.planner);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const updateDimensions = () => {
      setStyle({ left: unplannedRef.current.offsetLeft });
    };

    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isSummerEnabled, unplanned]);

  return (
    <div className="unplannedContainer" style={style}>
      <div className="gridItem">Unplanned</div>
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
    </div>
  );
};

export default UnplannedColumn;
