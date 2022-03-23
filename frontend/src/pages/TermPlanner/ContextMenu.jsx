import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, theme } from "react-contexify";
import { plannerActions } from "../../../actions/plannerActions";
import { courseTabActions } from "../../../actions/courseTabActions";
import "react-contexify/dist/ReactContexify.css";
import { useNavigate } from "react-router-dom";
import { updateAllWarnings } from "../ValidateTermPlanner";
import { FaCalendarTimes, FaTrash, FaInfoCircle } from "react-icons/fa";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { years, startYear, courses, completedTerms } = useSelector((state) => {
    return state.planner;
  });

  const handleDelete = () => {
    dispatch(plannerActions("REMOVE_COURSE", code));
    console.log(courses);
    updateAllWarnings(dispatch, { years, startYear, completedTerms });
  };

  const handleUnschedule = () => {
    // console.log(code);
    dispatch(plannerActions("UNSCHEDULE", code));
    console.log(courses);
    updateAllWarnings(dispatch, { years, startYear, completedTerms });
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    navigate(`/course-selector`);
    // dispatch(courseTabActions("SET_ACTIVE_TAB", 1));
    dispatch(courseTabActions("ADD_TAB", code));
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
