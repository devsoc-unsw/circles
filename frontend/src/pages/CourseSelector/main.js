import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FilterOutlined } from '@ant-design/icons';
import { getAllCourses } from '../../actions/updateCourses';
import { getUnplannedCourses } from '../../actions/userAction';
// import classes from './CourseSelector.module.css';
import './main.less';
import SearchCourse from './SearchCourse';
import CourseMenu from './CourseMenu';
import CourseDescription from './CourseDescription';
import { courseOptionsActions } from '../../actions/courseOptionsActions';
import { plannerActions } from '../../actions/plannerActions';
import { Button } from 'antd';

export default function CourseSelector() {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.updateCourses.courses);
  const degree = useSelector(state => state.degree);
  const core = useSelector(store => store.courseOptions.core);
  const courseOptions = useSelector(store => store.courseOptions);
  // const unplanned = useSelector(state => state.user.unplanned);
  // const [courseId, setCourseId] = useState('0');

  // useEffect(() => {
  //   dispatch(getDegree());
  // }, []);

  useEffect(() => {
    dispatch(getUnplannedCourses());
  }, []);

  useEffect(() => {
    dispatch(getAllCourses());
  }, []);

  const addAllCoreToPlan = () => {
    courseOptions.core.map(course => dispatch(plannerActions('ADD_TO_UNPLANNED', Object.keys(course)[0], course)));
  }

  const removeAllPlanned = () => {
    dispatch(plannerActions('REMOVE_ALL_UNPLANNED', []));
  }

  const resetSelectedCourses = () => {
    dispatch(courseOptionsActions('SET_ELECTIVE_COURSES', []));
    dispatch(courseOptionsActions('SET_GENED_COURSES', []));
  }

  return (
    <>
    {/* {JSON.stringify(courses)} */}
      <div className='cs-root'>
        <div className='cs-top-cont'>
        {/* { JSON.stringify(degree) } */}
          <div className='cs-degree-cont'>
            <h1 className='text'>{ degree.code } - { degree.name }</h1>
          </div>
          <SearchCourse courses={ courses } />
        </div>
        <div className='cs-bottom-cont'>
          <CourseMenu/>
          <CourseDescription />
        </div>
        {/* UNPLANNED {JSON.stringify(unplanned)} */}
      </div>
    </>
  );
}