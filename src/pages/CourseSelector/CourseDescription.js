import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CourseList from './CourseList';
import classes from './CourseDescription.module.css';

export default function CourseDescription() {
  const { id } = useParams();
  const [prereq, setPrereq] = useState(['COMP1511', 'DPST1091', 'COMP1917', 'COMP1921']);
  const [nextCourses, setNextCourses] = useState(['COMP2511']);
  
  return (
    <div className={ classes.cont }>
      {/* {id} */}
      <div className={ classes.contents }>
        <div className={ classes.top }>
          <div>
            <h2 className={ classes.code }>COMP1531</h2>
            <h1 className={ classes.name }>Introduction to Software Design</h1>
          </div>
          <Button className={ classes.btn } type="primary" icon={<PlusOutlined />}>
            Add to planner
          </Button>
        </div>
        <h3 className={ classes.subhead }>Overview</h3>
        <p>This course provides an introduction to software engineering principles: basic software lifecycle concepts, modern development methodologies, conceptual modeling and how these activities relate to programming. It also introduces the basic notions of team-based project management via conducting a project to design, build and deploy a simple web-based application. It is typically taken in the term after completing COMP1511, but could be delayed and taken later. It provides essential background for the teamwork and project management required in many later courses.</p>
        <h3 className={ classes.subhead }>Prerequisites</h3>
        <CourseList data={ prereq }/>
        <h3 className={ classes.subhead }>Unlocks these next courses</h3>
        <CourseList data={ nextCourses }/>
      </div>
      <div>
        yoo
      </div>
    </div>
  );
}