import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Menu, Item, Separator, theme } from "react-contexify";
import { plannerActions } from "../../actions/plannerActions";
import "react-contexify/dist/ReactContexify.css";
import { useHistory } from "react-router-dom";
import { updateWarnings } from "./DragDropLogic";
import { FaCalendarTimes, FaTrash, FaInfoCircle, FaInfo } from "react-icons/fa";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { years, startYear, courses } = useSelector((state) => {
    return state.planner;
  });

  const handleDelete = () => {
    // console.log(code);
    dispatch(plannerActions("REMOVE_COURSE", code));
    console.log(courses);
    updateWarnings(years, startYear, courses, dispatch);
  };

  const handleUnschedule = () => {
    // console.log(code);
    dispatch(plannerActions("UNSCHEDULE", code));
    console.log(courses);
    updateWarnings(years, startYear, courses, dispatch);
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    history.push(`/course-selector/${code}`);
  };

  return (
    <Menu id={id} theme={theme.dark}>
      {plannedFor && (
        <Item onClick={handleUnschedule}>
          <FaCalendarTimes className="contextMenuIcon" /> Unschedule
        </Item>
      )}
      <Item onClick={handleDelete}>
        <FaTrash className="contextMenuIcon" /> Delete
      </Item>
      <Item onClick={handleInfo}>
        <FaInfoCircle className="contextMenuIcon" />
        Info
      </Item>
    </Menu>
  );
};

export default ContextMenu;
