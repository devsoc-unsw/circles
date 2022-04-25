import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { FaCalendarTimes, FaTrash, FaInfoCircle } from "react-icons/fa";
import updateAllWarnings from "../ValidateTermPlanner";
import { addTab } from "../../../reducers/courseTabsSlice";
import { removeCourse, unschedule } from "../../../reducers/plannerSlice";

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
          <FaCalendarTimes className="contextMenuIcon" /> Unschedule
        </Item>
      )}
      <Item onClick={handleDelete}>
        <FaTrash className="contextMenuIcon" /> Delete from Planner
      </Item>
      <Item onClick={handleInfo}>
        <FaInfoCircle className="contextMenuIcon" />
        View Info
      </Item>
    </Menu>
  );
};

export default ContextMenu;
