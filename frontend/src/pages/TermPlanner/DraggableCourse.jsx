import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { IoWarningOutline } from "react-icons/io5";
import ReactTooltip from "react-tooltip";
import { useContextMenu } from "react-contexify";
import ContextMenu from "./misc/ContextMenu";
import useMediaQuery from "../../hooks/useMediaQuery";

function DraggableCourse({ code, index }) {
  const { Text } = Typography;
  const { courses, isSummerEnabled, completedTerms } = useSelector((state) => {
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

  const displayContextMenu = (e) => {
    if (!isDragDisabled) show(e);
  };

  const isSmall = useMediaQuery("(max-width: 1400px)");

  const isDragDisabled = completedTerms.get(plannedFor);

  return (
    <>
      <Draggable
        isDragDisabled={isDragDisabled}
        draggableId={code}
        index={index}
      >
        {(provided) => (
          <li
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            style={{
              ...provided.draggableProps.style,
            }}
            className={`course ${isSummerEnabled && "summerViewCourse"} 
			${isDragDisabled && " dragDisabledCourse"} 
			${isDragDisabled && warning && " disabledWarning"}
			${warning === true && " warning"}`}
            data-tip
            data-for={code}
            id={code}
            onContextMenu={displayContextMenu}
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
      {/* display prereq tooltip for all courses. However, if a term is marked as complete 
	  and the course has no warning, then disable the tooltip */}
      {prereqDisplay !== "" && (!isDragDisabled || warning) && (
        <ReactTooltip id={code} place="bottom" className="tooltip">
          <div className="prereqsTooltip">Prerequisites:</div>
          {prereqDisplay}
        </ReactTooltip>
      )}
    </>
  );
}

export default DraggableCourse;
