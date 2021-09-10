import React from "react";
import { Typography, Badge } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { IoWarningOutline } from "react-icons/io5";
import ReactTooltip from "react-tooltip";
import { useContextMenu } from "react-contexify";
import ContextMenu from "./ContextMenu";
import useMediaQuery from "../../hooks/useMediaQuery";

function DraggableCourse({ code, index }) {
  //   let code = course.match(/([A-Z]{4}[0-9]{4}):/)[1];
  const { Text } = Typography;
  const { courses, isSummerEnabled } = useSelector((state) => {
    return state.planner;
  });
  const theme = useSelector((state) => state.theme);
  const courseName = courses.get(code)["title"];
  const prereqs = courses.get(code)["prereqs"];
  const prereqDisplay = prereqs.replaceAll("||", "or").replaceAll("&&", "and");
  const warning = courses.get(code)["warning"];
  const plannedFor = courses.get(code)["plannedFor"];

  const { show } = useContextMenu({
    id: `${code}-context`,
  });

  const isSmall = useMediaQuery("(max-width: 1400px)");
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
            className={`course ${warning && " warning"} ${
              isSummerEnabled && "summerViewCourse"
            }`}
            data-tip
            data-for={code}
            onContextMenu={show}
          >
            {warning && (
              <IoWarningOutline
                size={isSmall ? "1.5em" : "2.5em"}
                color={theme === "light" ? "#DC9930" : "white"}
                style={isSmall && { position: "absolute", marginRight: "8em" }}
              />
            )}
            <div>
              {isSmall ? (
                <Text className="text">{code}</Text>
              ) : (
                <>
                  <Text strong className="text">
                    {code}
                  </Text>
                  <Text className="text">: {courseName} </Text>
                </>
              )}
            </div>
          </li>
        )}
      </Draggable>
      <ContextMenu code={code} plannedFor={plannedFor} />
      {prereqDisplay != "" && (
        <ReactTooltip id={code} place="bottom" className="tooltip">
          <div style={{ fontWeight: "bold" }}>Prerequisites:</div>
          {prereqDisplay}{" "}
        </ReactTooltip>
      )}
    </>
  );
}

export default DraggableCourse;
