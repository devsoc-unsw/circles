import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCourses } from '../../actions/updateCourses';
import { getUnplannedCourses } from '../../actions/userAction';
import SearchCourse from './SearchCourse';
import CourseMenu from './CourseMenu';
import CourseDescription from './CourseDescription';
import './main.less';

export default function CourseSelector() {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.updateCourses.courses);
  const degree = useSelector(state => state.degree);

  useEffect(() => {
    dispatch(getUnplannedCourses());
  }, []);

  useEffect(() => {
    dispatch(getAllCourses());
  }, []);

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