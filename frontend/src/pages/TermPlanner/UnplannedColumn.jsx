import React from "react";
import { Collapse } from "antd";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import DraggableCourse from "./DraggableCourse";

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }

const UnplannedColumn = () => {
  const { Panel } = Collapse;
  const theme = useSelector((state) => state.theme);
  const { unplanned } = useSelector((state) => state.planner);

  return (
    <div className="unplannedColumn">
      <Collapse className="collapse" ghost={theme === "dark"}>
        <Panel header="Unplanned" key="unplanned">
          {unplanned
            .map((course, courseIndex) => (
              <Droppable droppableId={course} isDropDisabled>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="panel"
                  >
                    <DraggableCourse
                      code={course}
                      index={courseIndex}
                      key={course}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
        </Panel>
      </Collapse>
    </div>
  );
};

export default UnplannedColumn;
