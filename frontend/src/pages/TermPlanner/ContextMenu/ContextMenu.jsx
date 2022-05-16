/* eslint-disable */

import React, { useState } from "react";
import { Modal } from "antd";
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

  const { programCode, specialisation, minor } = useSelector(
    (state) => state.degree,
  );

  const handleDelete = () => {
    dispatch(removeCourse(code));
    validateTermPlanner(
      dispatch,
      { years, startYear, completedTerms },
      { programCode, specialisation, minor },
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
  const [isEditMarkVisible, setIsEditMarkVisible] = React.useState(false);

  const [markInput, setMarkInput] = useState("");

  const showEditMark = () => {
    setIsEditMarkVisible(true);
  }

  const validLetterGrades = ["FL", "PS", "CR", "DN", "HD"];
  

  const handleConfirmEditMark = (e) => {
    // Validate Input
    // TODO: function for this
    if (validLetterGrades.includes(markInput)){
      return True;
    }

    iv

    
    // Dispatch and reset state
    
    setMarkInput("");
    setIsEditMarkVisible(false);
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
          handleCancelEditMark={() => alert("implement cancel pls")}
        />
      </Modal>
    </>
  );
};

export default ContextMenu;
