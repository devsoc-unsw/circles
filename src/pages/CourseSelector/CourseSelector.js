import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { getAllCourses } from '../../actions/updateCourses';
import { getUnplannedCourses } from '../../actions/userAction';
import classes from './CourseSelector.module.css';
import SearchCourse from './SearchCourse';
import CourseMenu from './CourseMenu';
import CourseDescription from './CourseDescription';

const { Search } = Input;

export default function CourseSelector() {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.updateCourses.courses);
  const degree = useSelector(state => state.user.degree);
  const unplanned = useSelector(state => state.user.unplanned);
  const [courseId, setCourseId] = useState('0');

  // useEffect(() => {
  //   dispatch(getDegree());
  // }, []);

  useEffect(() => {
    dispatch(getUnplannedCourses());
  }, []);

  useEffect(() => {
    console.log('COURSE MENU');
    dispatch(getAllCourses());
  }, []);

  return (
    <>
    {/* {JSON.stringify(courses)} */}
      <div className={ classes.container }>
        <div className={ classes.topCont }>
        {/* { JSON.stringify(degree) } */}
          <div className={ classes.degreeCont }>
            <h1 className={ classes.zero }>{ degree.code } - { degree.name }</h1>
            <h2 className={ `${classes.zero} ${classes.major}` }>{ degree.majors[0].code }</h2>
          </div>
          <div className={ classes.searchCont }>
            <SearchCourse courses={ courses } setCourseId={ setCourseId } />
            {/* <Search placeholder="Search a course" allowClear style={{ width: '20rem', marginRight: '0.5rem' }} /> */}
            <FilterOutlined style={{ cursor: 'pointer', fontSize: '1.3rem' }}/>
          </div>
        </div>
        <div className={ classes.bottomCont }>
          <CourseMenu courses={ courses } courseId={ courseId } />
          <Route path="/course-selector/:id">
            <CourseDescription setCourseId={ setCourseId }/>
          </Route>
        </div>
        {/* UNPLANNED {JSON.stringify(unplanned)} */}
      </div>
    </>
  );
}