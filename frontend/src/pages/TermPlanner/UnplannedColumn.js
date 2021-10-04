import React from "react";
// import { updateDegreeLength } from "../../actions/userAction";
// import { plannerActions } from "../../actions/plannerActions";
import { Collapse } from "antd";
import { Droppable } from "react-beautiful-dnd";
import DraggableCourse from "./DraggableCourse";
import { useSelector, useDispatch } from "react-redux";

const UnplannedColumn = ({ visible, setVisible }) => {
  const { Panel } = Collapse;
  const theme = useSelector((state) => state.theme);
  const { 
    courses,
    unplanned,
    // isSummerEnabled
  } = useSelector(state => state.planner);

  const dispatch = useDispatch();
  const sortedUnplanned = sortUnplanned(unplanned, courses);

  // function onChange(date, dateString) {
  //   console.log(date, dateString);
  // }

  // function handleChange(value) {
  //   dispatch(updateDegreeLength(value));
  // }

  // function handleSummerToggle() {
  //   dispatch(plannerActions("TOGGLE_SUMMER"));
  // }

  // const years = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <>
      {Object.keys(sortedUnplanned).length != 0 && (
        <div className="unplannedColumn">
          <div className="gridItem" style={{ marginBottom: "0.5em" }}>
            Unplanned
          </div>
          <Collapse className="collapse" ghost={theme === "dark"}>
            {Object.keys(sortedUnplanned)
              .sort()
              .map((type, index) => (
                <Panel header={type} key={index}>
                  <Droppable droppableId={type} isDropDisabled={true}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="panel"
                      >
                        {sortedUnplanned[type].map((code, index) => (
                          <DraggableCourse
                            code={code}
                            index={index}
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
      )}
    </>
  );
};

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }
const sortUnplanned = (unplanned, courses) => {
  if (unplanned == null) return {};
  let courseTypes = {};
  unplanned.forEach((code) => {
    const type = courses.get(code)["type"];
    if (!courseTypes.hasOwnProperty(type)) {
      courseTypes[type] = [code];
    } else {
      courseTypes[type].push(code);
    }
  });
  return courseTypes;
};

export default UnplannedColumn;
