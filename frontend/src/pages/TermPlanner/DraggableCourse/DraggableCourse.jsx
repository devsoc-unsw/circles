/* eslint-disable */

import React from "react";
import { Typography } from "antd";
import { Draggable } from "react-beautiful-dnd";
import { useSelector } from "react-redux";
import ReactTooltip from "react-tooltip";
import { useContextMenu } from "react-contexify";
import { WarningOutlined, InfoCircleOutlined } from "@ant-design/icons";
import useMediaQuery from "../../../hooks/useMediaQuery";
import ContextMenu from "../ContextMenu";
import Marks from "../../../components/Marks";
import KebabMenu from "../../../components/KebabMenu";

import "./index.less";

const DraggableCourse = ({ code, index, showMarks }) => {
  const { Text } = Typography;
  const { courses, isSummerEnabled, completedTerms } = useSelector((state) => state.planner);
  const theme = useSelector((state) => state.theme);
  // prereqs are populated in CourseDescription.jsx via course.raw_requirements
  const {
    prereqs, title, isUnlocked, plannedFor,
    isLegacy, isAccurate, termsOffered, handbookNote, supressed,
  } = courses[code];
  const warningMessage = courses[code].warnings;
  const isOffered = plannedFor ? termsOffered.includes(plannedFor.match(/T[0-3]/)[0]) : true;
  const BEwarnings = handbookNote !== "" || !!warningMessage.length;

  const { show } = useContextMenu({
    id: `${code}-context`,
  });

  const isDragDisabled = !!completedTerms[plannedFor];

  const displayContextMenu = (e) => {
    if (!isDragDisabled) show(e);
  };

  const isSmall = useMediaQuery("(max-width: 1400px)");
  const shouldHaveWarning = !supressed && (
    isLegacy || !isUnlocked || BEwarnings || !isAccurate || !isOffered
  );
  const errorIsInformational = shouldHaveWarning && isUnlocked
    && warningMessage.length === 0 && !isLegacy && isAccurate && isOffered;


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
            ${(!supressed && (!isUnlocked || !isOffered)) && " warning"}
            draggable-course-container`}
            data-tip
            data-for={code}
            id={code}
            onContextMenu={displayContextMenu}
          >
            {!isDragDisabled && shouldHaveWarning
              && (errorIsInformational ? <InfoCircleOutlined style={{ color: "#000" }} /> : (
                <WarningOutlined
                  className="alert"
                  style={{ color: theme === "light" ? "#DC9930" : "white" }}
                />
              ))}
            <div>
              <div className="draggable-course-info">
                {isSmall ? (
                  <Text className="text">{code}</Text>
                ) : (
                  <div>
                    <Text strong className="text">
                      {code}
                    </Text>
                    <Text className="text">: {title} </Text>
                  </div>
                )}
                {showMarks ? (
                  <Marks
                    courseCode={"COMP1511"}
                  />
                ) : null
                }
                </div>
            </div>
            <div className="kebab-container">
              <KebabMenu
                data-tip
                data-for={code}
                id={code}
                onClick={displayContextMenu}
              />
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
                : warningMessage.length !== 0 ? warningMessage.join("\n")
                  : handbookNote}
          {!isAccurate ? " The course info may be inaccurate." : ""}
        </ReactTooltip>
      )}
    </>
  );
};

export default DraggableCourse;
