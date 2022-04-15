import React from "react";
import { Collapse } from "antd";
import { Droppable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import DraggableCourse from "./DraggableCourse";

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }
const sortUnplanned = (unplanned, courses) => {
  if (unplanned == null) return {};
  const courseTypes = {};
  unplanned.forEach((code) => {
    const { type } = courses.get(code);
    if (courseTypes[type] === undefined) courseTypes[type] = [];
    courseTypes[type] = [...courseTypes[type], code];
  });
  return courseTypes;
};

const UnplannedColumn = () => {
  const { Panel } = Collapse;
  const theme = useSelector((state) => state.theme);
  const { courses, unplanned } = useSelector((state) => state.planner);

  const sortedUnplanned = sortUnplanned(unplanned, courses);

  return (
    Object.keys(sortedUnplanned).length !== 0 && (
    <div className="unplannedColumn">
      <div className="gridItem" style={{ marginBottom: "0.5em" }}>
        Unplanned
      </div>
      <Collapse className="collapse" ghost={theme === "dark"}>
        {Object.keys(sortedUnplanned)
          .sort()
          .map((type, index) => (
            <Panel header={type} key={index}>
              <Droppable droppableId={type} isDropDisabled>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="panel"
                  >
                    {sortedUnplanned[type].map((code, codeIndex) => (
                      <DraggableCourse
                        code={code}
                        index={codeIndex}
                        key={code}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Panel>
          ))}
      </Collapse>
    </div>
    )
  );
};

export default UnplannedColumn;
