import React from 'react';
import { Tag } from 'antd';
import classes from './CourseList.module.css';

export default function CourseList(props) {
  return (
    <div className={ classes.list }>
      {
        props.data && props.data.map(course => {
          return (
            <Tag>{ course }</Tag>
          )
        })
      }
    </div>
  );
}