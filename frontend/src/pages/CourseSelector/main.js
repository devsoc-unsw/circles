import React, { useEffect, useState } from 'react';
import { Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FilterOutlined } from '@ant-design/icons';
import { getAllCourses } from '../../actions/updateCourses';
import { getUnplannedCourses } from '../../actions/userAction';
import classes from './CourseSelector.module.css';
import SearchCourse from './SearchCourse';
import CourseMenu from './CourseMenu';
import CourseDescription from './CourseDescription';

export default function CourseSelector() {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.updateCourses.courses);
  const degree = useSelector(state => state.degree);
  // const unplanned = useSelector(state => state.user.unplanned);
  const [courseId, setCourseId] = useState('0');

  // useEffect(() => {
  //   dispatch(getDegree());
  // }, []);

  useEffect(() => {
    dispatch(getUnplannedCourses());
  }, []);

  useEffect(() => {
    dispatch(getAllCourses());
  }, []);

  return (
    <>
    {/* {JSON.stringify(courses)} */}
      <div className={ classes.container }>
        <div className={ classes.topCont }>
        {/* { JSON.stringify(degree) } */}
          <div className={ classes.degreeCont }>
            <h1 className={ `${classes.zero} text` }>{ degree.code } - { degree.name }</h1>
            {/* @Gabriella, you should not assume that there will be a major. Consider working together with Sally to make a data structure for degree. */}
            {/* <h2 className={ `${classes.zero} ${classes.major} text` }>{ degree.majors[0].code }</h2> */}
          </div>
          <div className={ classes.searchCont }>
            <SearchCourse courses={ courses } setCourseId={ setCourseId } />
            {/* <Search placeholder="Search a course" allowClear style={{ width: '20rem', marginRight: '0.5rem' }} /> */}
            <FilterOutlined style={{ cursor: 'pointer', fontSize: '1.3rem' }}/>
          </div>
        </div>
        <div className={ classes.bottomCont }>
          <CourseMenu courses={ courses } courseId={ courseId } />
            {
              courseId === '0' ?

              <div className={ classes.empty }>
                <h3 className={`text ${ classes.emptyText }`}>Select a course on the left to view! (っ＾▿＾)۶🍸🌟🍺٩(˘◡˘ )</h3>
              </div>
              :
              <></>
            }
          <Route path="/course-selector/:id">
            <CourseDescription setCourseId={ setCourseId }/>
          </Route>
        </div>
        {/* UNPLANNED {JSON.stringify(unplanned)} */}
      </div>
    </>
  );
}