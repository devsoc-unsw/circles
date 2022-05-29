/* eslint-disable */

import React, { useState } from "react";
import { Modal , message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, InfoCircleFilled } from "@ant-design/icons";
import { FaEdit, FaRegCalendarTimes } from "react-icons/fa";
import { addTab } from "../../../reducers/courseTabsSlice";
import { removeCourse, unschedule, updateCourseMark } from "../../../reducers/plannerSlice";
import EditMarks from "../EditMarks";

import "./index.less";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = () => {
    dispatch(removeCourse(code));
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

  const showEditMark = () => {
    setIsEditMarkVisible(true);
  }

  const validLetterGrades = ["FL", "PS", "CR", "DN", "HD"];
  const [markInputBuf, setMarkInputBuf] = useState(
    useSelector((state) => state.planner.courses[code].mark));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleConfirmEditMark(markInputBuf);
    }
  }

  const handleConfirmEditMark = (mark) => {
    const attemptedMark = (' ' + mark).slice(1).replace(" ", "");
    
    if (
      (isNaN(attemptedMark) && !validLetterGrades.includes(attemptedMark))
      || (parseFloat(attemptedMark) < 0 || parseFloat(attemptedMark) > 100)
    ) {
      return message.error("Could not update mark. Please enter a valid mark or letter grade");
    }

    dispatch(updateCourseMark({
      "code": code,
      "mark": isNaN(attemptedMark) ? attemptedMark : parseInt(attemptedMark),
    }));
    setIsEditMarkVisible(false);
    return message.success("Mark Updated");
  }

  const handleCancelEditMark = () => {
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
        onOk={handleConfirmEditMark}
        onCancel={handleCancelEditMark}
        width="300px"// 
      >
        <EditMarks
          courseCode={code}
          inputBuffer={markInputBuf}
          setInputBuffer={setMarkInputBuf}
          handleKeyDown={handleKeyDown}
          handleConfirm={handleConfirmEditMark}
        />
      </Modal>
    </>
  );
};

export default ContextMenu;
