import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { DeleteFilled, InfoCircleFilled } from "@ant-design/icons";
import { FaRegCalendarTimes } from "react-icons/fa";
import updateAllWarnings from "../ValidateTermPlanner";
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
    updateAllWarnings(
      dispatch,
      { years, startYear, completedTerms },
      { programCode, specialisation, minor },
    );
  };

  const handleUnschedule = () => {
    dispatch(unschedule(code));
    updateAllWarnings(
      dispatch,
      { years, startYear, completedTerms },
      { programCode, specialisation, minor },
    );
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    navigate("/course-selector");
    dispatch(addTab(code));
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
    </Menu>
  );
};

export default ContextMenu;
