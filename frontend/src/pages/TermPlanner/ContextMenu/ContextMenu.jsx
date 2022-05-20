/* eslint-disable */

import React, { useState } from "react";
import { Modal , message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, InfoCircleFilled } from "@ant-design/icons";
import { FaEdit, FaRegCalendarTimes } from "react-icons/fa";
import validateTermPlanner from "../validateTermPlanner";
import { addTab } from "../../../reducers/courseTabsSlice";
import { removeCourse, unschedule } from "../../../reducers/plannerSlice";
import EditMarks from "../../../components/EditMarks";

import "./index.less";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { years, startYear, completedTerms } = useSelector((state) => state.planner);

  const { programCode, majors, minor } = useSelector(
    (state) => state.degree,
  );

  const handleDelete = () => {
    dispatch(removeCourse(code));
    validateTermPlanner(
      dispatch,
      { years, startYear, completedTerms },
      { programCode, majors, minor },
    );
  };

  const handleUnschedule = () => {
    dispatch(unschedule({
      destIndex: null,
      code,
    }));
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    navigate("/course-selector");
    dispatch(addTab(code));
  };

  // EDIT MARK - TODO: remove this comment - only for visual seperation
  // ? make this a part of the state?
  const [isEditMarkVisible, setIsEditMarkVisible] = useState(false);

  const [markInput, setMarkInput] = useState("");

  const showEditMark = () => {
    setIsEditMarkVisible(true);
  }

  const validLetterGrades = ["FL", "PS", "CR", "DN", "HD"];
  const [markInputBuf, setMarkInputBuf] = useState(
    useSelector((state) => state.planner.courses[code].mark));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleConfirmEditMark();
    }
  }

  const handleConfirmEditMark = () => {
    const attemptedMark = (' ' + markInputBuf).slice(1).replace(" ", "");
    
    // Validate mark
    if (
      (isNaN(attemptedMark) && !validLetterGrades.includes(attemptedMark))
      || (parseFloat(attemptedMark) < 0 || parseFloat(attemptedMark) > 100)
    ) {
      return message.error("Could not update mark. Please enter a valid mark or letter grade");
    }
    
    // TODO: Dispatch and reset state
    setMarkInput("");
    setIsEditMarkVisible(false);
    return message.success("Mark Updated")
  }

  const handleCancelEditMark = () => {
    setMarkInput("");
    setIsEditMarkVisible(false);
  }

  return (
    <>
      <Menu id={id} theme={theme.dark}>
        {plannedFor && (
          <Item onClick={handleUnschedule}>
            <FaRegCalendarTimes className="context-menu-icon" /> Unschedule
          </Item>
        )}
        <Item onClick={handleDelete}>
          <DeleteFilled className="context-menu-icon" /> Delete from Planner
        </Item>
        <Item onClick={showEditMark}>
          <FaEdit className="contextMenuIcon" /> Edit mark
        </Item>
        <Item onClick={handleInfo}>
          <InfoCircleFilled className="context-menu-icon" />
          View Info
        </Item>
      </Menu>
      <Modal
        title={`Edit Mark: ${code}`}
        visible={isEditMarkVisible}
        // visible={true}
        onOk={handleConfirmEditMark}
        onCancel={handleCancelEditMark}
        // footer={ null // <EditMarksFooter // /> }
        width="300px"// 
      >
        <EditMarks
          courseCode="COMP1511"
          courseTitle="Introduction to testing"
          handleKeyDown={handleKeyDown}
          inputBuffer={markInputBuf}
          setInputBuffer={setMarkInputBuf}
        />
      </Modal>
    </>
  );
};

export default ContextMenu;
