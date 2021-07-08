import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CourseList from './CourseList';
import { getCourseById } from '../../actions/updateCourses';
import classes from './CourseDescription.module.css';

export default function CourseDescription(props) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const course = useSelector(state => state.updateCourses.course);

  useEffect(() => {
    dispatch(getCourseById(id));
    props.setCourseId(id);
  }, [id]);
  
  return (
    <div className={ classes.cont }>
      <div className={ classes.contents }>
        <div className={ classes.top }>
          <div>
            <h2 className={ classes.code }>{ id }</h2>
            <h1 className={ classes.name }>{ course.name }</h1>
          </div>
          <Button className={ classes.btn } type="primary" icon={<PlusOutlined />}>
            Add to planner
          </Button>
        </div>
        <h3 className={ classes.subhead }>Overview</h3>
        <p>{ course.overview }</p>
        <h3 className={ classes.subhead }>Prerequisites</h3>
        <CourseList data={ course.prereq }/>
        <h3 className={ classes.subhead }>Unlocks these next courses</h3>
        <CourseList data={ course.next }/>
      </div>
      <div>
        <h3 className={ classes.subhead }>Faculty</h3>
        <p>{ course.faculty }</p>
        <h3 className={ classes.subhead }>School</h3>
        <p>{ course.school }</p>
        <h3 className={ classes.subhead }>Study Level</h3>
        <p>{ course.level }</p>
        <h3 className={ classes.subhead }>Offering Terms</h3>
        <div className={ classes.list }>
          {
            course.terms && course.terms.map(term => {
              return (
                <Tag>{ isNaN(term) ? `${term} Term` : `Term ${term}` }</Tag>
              )
            })
          }
        </div>
        <h3 className={ classes.subhead }>Campus</h3>
        <p>{ course.campus }</p>
      </div>
    </div>
  );
}