import React, { useState, useEffect } from "react";
import { Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, InfoCircleFilled } from "@ant-design/icons";
import { FaEdit, FaRegCalendarTimes } from "react-icons/fa";
import validateTermPlanner from "../validateTermPlanner";
import { addTab } from "../../../reducers/courseTabsSlice";
import { removeCourse, unschedule, updateCourseMark } from "../../../reducers/plannerSlice";
import EditMarks from "../EditMarks";

import "./index.less";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { years, startYear, completedTerm } = useSelector((state) => state.planner);

  const { programCode, majors, minor } = useSelector(
    (state) => state.degree,
  );

  const handleDelete = () => {
    dispatch(removeCourse(code));
    validateTermPlanner(
      dispatch,
      { years, startYear, completedTerm },
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

  // const [markInput, setMarkInput] = useState("");

  const showEditMark = () => {
    setIsEditMarkVisible(true);
  };

  const validLetterGrades = ["SY", "PS", "CR", "DN", "HD"];
  const [markInputBuf, setMarkInputBuf] = useState(
    useSelector((state) => state.planner.courses[code].mark),
  );

  const handleConfirmEditMark = (mark) => {
    const attemptedMark = (` ${mark}`).slice(1).replace(" ", "");
    if (
      (attemptedMark.isNaN && !validLetterGrades.includes(attemptedMark))
      || (parseFloat(attemptedMark) < 0 || parseFloat(attemptedMark) > 100)
    ) {
      return message.error("Could not update mark. Please enter a valid mark or letter grade");
    }
    dispatch(updateCourseMark({
      code,
      mark: attemptedMark,
    }));
    setIsEditMarkVisible(false);
    // ! TODO: validateTermPlanner
    return message.success("Mark Updated");
  };

  const [markUpdatedQueued, setMarkUpdateQueued] = useState(false);
  useEffect(() => {
    if (markUpdatedQueued) {
      setMarkUpdateQueued(false);
      handleConfirmEditMark(markInputBuf);
    }
  });

  const queueEditMark = () => {
    setMarkUpdateQueued(true);
  };

  const handleCancelEditMark = () => {
    setIsEditMarkVisible(false);
    setMarkUpdateQueued(false);
  };

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
        width="300px"
      >
        <EditMarks
          courseCode={code}
          inputBuffer={markInputBuf}
          letterGrades={validLetterGrades}
          setInputBuffer={setMarkInputBuf}
          handleConfirm={queueEditMark}
        />
      </Modal>
    </>
  );
};

export default ContextMenu;
