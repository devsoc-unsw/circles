import React from "react";
import { useDispatch } from "react-redux";
import { Menu, Item, Separator, theme } from "react-contexify";
import { plannerActions } from "../../actions/plannerActions";
import "react-contexify/dist/ReactContexify.css";
import { useHistory } from "react-router-dom";

const ContextMenu = ({ code, plannedFor }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const handleDelete = () => {
    console.log(code);
    dispatch(plannerActions("REMOVE_COURSE", code));
  };

  const handleUnschedule = () => {
    console.log(code);
    dispatch(plannerActions("UNSCHEDULE", code));
  };
  const id = `${code}-context`;

  const handleInfo = () => {
    history.push(`/course-selector/${code}`);
  };

  return (
    <Menu id={id} theme={theme.dark}>
      {plannedFor && <Item onClick={handleUnschedule}>Unschedule</Item>}
      <Item onClick={handleDelete}>Delete</Item>
      <Item onClick={handleInfo}>Info</Item>
    </Menu>
  );
};

export default ContextMenu;
