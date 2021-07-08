import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import classes from './CourseSelector.module.css';
import CourseMenu from './CourseMenu';
import CourseDescription from './CourseDescription';

const { Search } = Input;

export default function CourseSelector() {
  const dispatch = useDispatch();
  const degree = useSelector(state => state.user.degree);

  // useEffect(() => {
  //   dispatch(getDegree());
  // }, []);

  return (
    <>
      <div className={ classes.container }>
        <div className={ classes.topCont }>
        {/* { JSON.stringify(degree) } */}
          <div className={ classes.degreeCont }>
            <h1 className={ classes.zero }>{ degree.code } - { degree.name }</h1>
            <h2 className={ `${classes.zero} ${classes.major}` }>{ degree.majors[0].code }</h2>
          </div>
          <div className={ classes.searchCont }>
            <Search placeholder="Search a course" allowClear /* onSearch={onSearch} */ style={{ width: '20rem', marginRight: '0.5rem' }} />
            <FilterOutlined style={{ cursor: 'pointer', fontSize: '1.3rem' }}/>
          </div>
        </div>
        <div className={ classes.bottomCont }>
          <CourseMenu />
          <Route path="/course-selector/:id">
            <CourseDescription />
          </Route>
        </div>
      </div>
    </>
  );
}