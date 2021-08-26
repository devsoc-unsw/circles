import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { courseTabActions } from '../../actions/courseTabActions';
import { Tag } from 'antd';
import './courseTag.less'

// NOTE: Tooltip not working
export const CourseTag = ({ name }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(courseTabActions("ADD_TAB", name));
  }

  // dark mode always has white text
  const theme = useSelector((state) => state.theme);
  return (
      <Tag onClick={handleClick} className={'text tag'}>
        { name }
      </Tag>
  );
}
