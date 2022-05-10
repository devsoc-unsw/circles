/* eslint-disable */

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, InfoCircleFilled } from "@ant-design/icons";
import { FaEdit, FaRegCalendarTimes } from "react-icons/fa";
import validateTermPlanner from "../validateTermPlanner";
import { addTab } from "../../../reducers/courseTabsSlice";
import { removeCourse, unschedule } from "../../../reducers/plannerSlice";
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

  const editMark = (e, code) => {
    e.stopPropagation();
    const x = e.y;
    const y = e.x;
    // TODO: Obviously, remove this
    // eslint-disable-next-line no-console
    console.log(x, y);
    return x + y;
  };

  return (
    <Menu id={id} theme={theme.dark}>
      {plannedFor && (
        <Item onClick={handleUnschedule}>
          <FaRegCalendarTimes className="context-menu-icon" /> Unschedule
        </Item>
      )}
      <Item onClick={handleDelete}>
        <DeleteFilled className="context-menu-icon" /> Delete from Planner
      </Item>
      <Item onClick={handleInfo}>
        <InfoCircleFilled className="context-menu-icon" />
        View Info
      </Item>
      <Item onClick={editMark}>
        <FaEdit className="contextMenuIcon" /> Edit mark
      </Item>
    </Menu>
  );
};

export default ContextMenu;
