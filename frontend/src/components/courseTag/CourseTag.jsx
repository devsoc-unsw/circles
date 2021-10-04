import React from 'react';
import { useDispatch } from "react-redux";
import { courseTabActions } from '../../actions/courseTabActions';
import { Tag } from 'antd';
import './courseTag.less'

export const CourseTag = ({ name }) => {
  const dispatch = useDispatch();
  const handleClick = () => {
    dispatch(courseTabActions("ADD_TAB", name));
  }

  return (
      <Tag onClick={handleClick} className={'text tag'}>
        { name }
      </Tag>
  );
}
