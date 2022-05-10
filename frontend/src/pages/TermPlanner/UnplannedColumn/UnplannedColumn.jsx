import React, { useState, useEffect, useRef } from "react";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import DraggableCourse from "../DraggableCourse";
import "./index.less";

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }

const UnplannedColumn = ({ isDragging, plannerRef }) => {
  const { isSummerEnabled, unplanned } = useSelector((state) => state.planner);
  const [style, setStyle] = useState({});
  const isSummerRef = useRef(isSummerEnabled);

  useEffect(() => {
    isSummerRef.current = isSummerEnabled;

    const updateDimensions = () => {
      console.log(plannerRef);
      const offsetLeftGrid = plannerRef.current.offsetLeft;
      console.log("left: ", offsetLeftGrid);
      let widthTP = 0;
      const columns = isSummerRef.current ? 5 : 4;
      for (let i = 0; i < columns; i++) {
        console.log("width ", i, plannerRef.current.children[i].scrollWidth);
        widthTP += plannerRef.current.children[i].scrollWidth;
      }

      setStyle({
        left: offsetLeftGrid + widthTP,
      });
    };

    window.addEventListener("resize", updateDimensions);
    // const interval = setTimeout(updateDimensions(), 200);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      // clearTimeout(interval);
    };
  }, [isSummerEnabled]);

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
