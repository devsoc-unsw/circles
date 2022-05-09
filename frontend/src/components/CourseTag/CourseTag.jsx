import React from "react";
import { useDispatch } from "react-redux";
import { Tag } from "antd";
import { addTab } from "../../reducers/courseTabsSlice";
import "./index.less";

const CourseTag = ({ name }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(addTab(name));
  };

  return (
    <Tag onClick={handleClick} className="text tag">
      { name }
    </Tag>
  );
};

export default CourseTag;
