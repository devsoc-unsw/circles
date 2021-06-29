import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import classes from './CourseSelector.module.css';

export default function CourseDescription() {
  const { id } = useParams();
  
  return (
    <div className={ classes.CDcont }>
      {id}
    </div>
  );
}