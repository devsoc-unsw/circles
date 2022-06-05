import React, { useState } from "react";
import { Item, Menu, theme } from "react-contexify";
import { FaRegCalendarTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, EditFilled, InfoCircleFilled } from "@ant-design/icons";
import { addTab } from "reducers/courseTabsSlice";
import { removeCourse, unschedule } from "reducers/plannerSlice";
import EditMarkModal from "../EditMarkModal";
import "react-contexify/dist/ReactContexify.css";
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

  const [isEditMarkVisible, setIsEditMarkVisible] = useState(false);

  const showEditMark = () => {
    setIsEditMarkVisible(true);
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
          <EditFilled className="context-menu-icon" />
          Edit mark
        </Item>
        <Item onClick={handleInfo}>
          <InfoCircleFilled className="context-menu-icon" />
          View Info
        </Item>
      </Menu>
      <EditMarkModal
        code={code}
        isVisible={isEditMarkVisible}
        setIsVisible={setIsEditMarkVisible}
      />
    </>
  );
};

export default ContextMenu;
