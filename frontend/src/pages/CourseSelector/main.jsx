import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { courseActions } from '../../actions/courseActions';
import { SearchCourse } from './SearchCourse';
import { CourseMenu } from './CourseMenu';
import { CourseDescription } from './CourseDescription';
import './main.less';

export default function CourseSelector() {
  const dispatch = useDispatch();
  const courses = useSelector(state => state.courses);
  const degree = useSelector(store => store.degree);
  const [courseId, setCourseId] = React.useState('0');

  return (
    <div className='root'>
      <div className='banner'>
          <h1 className='text'>{ degree.program.code } - { degree.program.name }</h1>
          <h2 className='text'>{ degree.specialisation.code } | { degree.specialisation.name }</h2>
          <SearchCourse />
      </div>
      {/* TODO: Need to fix height of an empty course description */}
      <div className='course-content'>
          <CourseMenu/>
          <CourseDescription />
      </div>
    </div>
  );
}