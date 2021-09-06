import React from "react";
import { useDispatch } from "react-redux";
import { Menu, Item, Separator, theme } from "react-contexify";
import { plannerActions } from "../../actions/plannerActions";
import "react-contexify/dist/ReactContexify.css";

const ContextMenu = ({ code }) => {
  const dispatch = useDispatch();
  const handleDelete = () => {
    console.log(code);
    dispatch(plannerActions("REMOVE_COURSE", code));
  };
  const id = `${code}-context`;
  return (
    <Menu id={id} theme={theme.dark}>
      <Item>Unschedule</Item>
      <Item onClick={handleDelete}>Delete</Item>
    </Menu>
  );
};

export default ContextMenu;
