import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { IoWarningOutline } from "react-icons/io5";
import ReactTooltip from "react-tooltip";

function DraggableCourse({ code, index, warning }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Text } = Typography;
  const { courses } = useSelector((state) => {
    return state.planner;
  });
  const courseName = courses.get(code)["title"];
  const prereqs = courses.get(code)["prereqs"];
  //   eval(COMP1511 || COMP1521 && (COMP1531 || COMP1541);
  const prereqDisplay = prereqs.replaceAll("||", "or").replaceAll("&&", "and")
  const prereqArray = prereqDisplay.split(" and ")

  return (
    <>
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
            data-tip
            data-for={warning && code}
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
      <ReactTooltip id={code} place="bottom" className="tooltip">
        <Text strong>Prerequisites: </Text>
		{prereqDisplay}
        {/* {prereqArray.map((prereq) => (
          <div key={prereq}>• {prereq}</div>
        ))} */}
      </ReactTooltip>
    </>
  );
}

export default DraggableCourse;
