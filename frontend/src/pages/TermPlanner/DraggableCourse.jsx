import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import { IoWarningOutline } from "react-icons/io5";
import ReactTooltip from "react-tooltip";
import { useContextMenu } from "react-contexify";
import ContextMenu from "./misc/ContextMenu";
import useMediaQuery from "../../hooks/useMediaQuery";

const DraggableCourse = ({ code, index }) => {
  const { Text } = Typography;
  const { courses, isSummerEnabled, completedTerms } = useSelector((state) => state.planner);
  const theme = useSelector((state) => state.theme);
  // prereqs are populated in CourseDescription.jsx via course.raw_requirements
  const {
    prereqs, title, isUnlocked, plannedFor, isLegacy, isAccurate, termsOffered, handbookNote,
  } = courses.get(code);
  const warningMessage = courses.get(code).warnings;
  const isOffered = plannedFor ? termsOffered.includes(plannedFor.match(/T[0-3]/)[0]) : true;
  const BEwarnings = handbookNote !== "" || !!warningMessage.length;

  const { show } = useContextMenu({
    id: `${code}-context`,
  });

  const isDragDisabled = completedTerms.get(plannedFor);

  const displayContextMenu = (e) => {
    if (!isDragDisabled) show(e);
  };

  const isSmall = useMediaQuery("(max-width: 1400px)");
  const shouldHaveWarning = (isLegacy || !isUnlocked || BEwarnings || !isAccurate || !isOffered);
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
            ${isDragDisabled && !isUnlocked && " disabledWarning"}
            ${(!isUnlocked || !isOffered) && " warning"}`}
            data-tip
            data-for={code}
            id={code}
            onContextMenu={displayContextMenu}
          >
            {!isDragDisabled && shouldHaveWarning && (
              <IoWarningOutline
                className="alert"
                size="2.5em"
                color={theme === "light" ? "#DC9930" : "white"}
                style={
                  isSmall && {
                    position: "absolute",
                    marginRight: "8em",
                  }
                }
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
                  <Text className="text">: {title} </Text>
                </>
              )}
            </div>
          </li>
        )}
      </Draggable>
      <ContextMenu code={code} plannedFor={plannedFor} />
      {/* display prereq tooltip for all courses. However, if a term is marked as complete
        and the course has no warning, then disable the tooltip */}
      {!isDragDisabled && shouldHaveWarning && (
        <ReactTooltip id={code} place="bottom" className="tooltip">
          {isLegacy ? "This course is discontinued. If an equivalent course is currently being offered, please pick that instead."
            : !isUnlocked ? prereqs.trim()
              : !isOffered ? "The course is not offered in this term."
                : warningMessage !== [] ? warningMessage.join("\n")
                  : handbookNote}
          {!isAccurate ? " The course info may be inaccurate." : ""}
        </ReactTooltip>
      )}
    </>
  );
};

export default DraggableCourse;
