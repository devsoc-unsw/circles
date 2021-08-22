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
            {/* @Gabriella, you should not assume that there will be a major. Consider working together with Sally to make a data structure for degree. */}
            {/* <h2 className={ `${classes.zero} ${classes.major} text` }>{ degree.majors[0].code }</h2> */}
          </div>
          {/* <div className={ classes.searchCont }> */}
          <SearchCourse courses={ courses } />
          <div className='cs-buttons'>
            <Button type="primary" style={{ marginRight: '0.5rem'}} onClick={ addAllCoreToPlan }>Add all core to plan</Button>
            <Button type="primary" style={{ marginRight: '0.5rem'}} onClick={ removeAllPlanned }>Remove unplanned from planner</Button>
            <Button type="primary" onClick={ resetSelectedCourses }>Reset selected courses</Button>
          </div>
            {/* <FilterOutlined style={{ cursor: 'pointer', fontSize: '1.3rem' }}/> */}
          {/* </div> */}
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