import React from 'react';
import { useSelector} from 'react-redux';
import { SearchCourse } from './SearchCourse';

import { CourseMenu } from './CourseMenu';
import { CourseDescription } from './CourseDescription';
import './main.less';


// TODO: Adjust dark theme for alert, would be good to have a component for alerts to be used in other pages as well
export default function CourseSelector() {
  const degree = useSelector(store => store.degree);
  if (!degree.program) {
    return (<div className='root'>Please chose a degree so we can personalise your course selection.</div>)
  }
  return (
    <div className='root'>
      <div className='banner'>
          <h1 className='text'>{ degree.program.code } - { degree.program.name }</h1>
          
          { degree.specialisation && 
            <h2 className='text'>
              { degree.specialisation.code } | { degree.specialisation.name }
            </h2>
          }
          <SearchCourse />
      </div>
      <div className='course-content'>
          <CourseMenu/>
          <CourseDescription />
      </div>
    </div>
  );
}