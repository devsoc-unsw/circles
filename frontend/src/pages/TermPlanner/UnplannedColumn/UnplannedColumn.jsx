import React, { useState, useEffect } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import DraggableCourse from "../DraggableCourse";
import "./index.less";

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }

const UnplannedColumn = ({ isDragging, plannerRef }) => {
  const { isSummerEnabled, unplanned } = useSelector((state) => state.planner);
  const [style, setStyle] = useState({});

  const calcLeft = (termGrid) => {
    const offsetLeftGrid = termGrid.offsetLeft;
    let widthTP = 0;
    const columns = isSummerEnabled ? 5 : 4;
    for (let i = 0; i < columns; i++) {
      widthTP += termGrid.children[i].offsetWidth;
    }
    return offsetLeftGrid + widthTP;
  };

  useEffect(() => {
    const updateDimensions = () => {
      setStyle({
        left: calcLeft(plannerRef.current),
      });
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

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
