import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useDispatch, useSelector } from 'react-redux';
import { Button, Tag, Alert, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CourseTag } from '../../components/courseTag/CourseTag';
// import { courseActions } from '../../actions/courseActions';
// import { addUnplannedCourse, setUnplannedCourses } from '../../actions/userAction';
import { getCourse } from './courseProvider';
import './CourseDescription.less';


const CourseAttribute = ({ header, description }) => {
  const upperCaseHeader = header.charAt(0).toUpperCase() + header.slice(1);
  return (
    <div className='attribute'> 
      <h3 className='subhead text'>{upperCaseHeader}</h3>
      <p className='text'>{description}</p>
    </div>
  )
}
export function CourseDescription() {
  const { courseCode } = useParams();
  const [showAlert, setShowAlert] = useState(false);
  if (!courseCode) {
    return (
      <h3 className={'text center'}>Select a course on the left to view! (っ＾▿＾)۶🍸🌟🍺٩(˘◡˘ )</h3>
    )
  }
  // const dispatch = useDispatch();
  const course = getCourse(courseCode);
  console.log(course.attributes);

  const addToPlanner = () => {
    // dispatch(addUnplannedCourse(id));
    setShowAlert(true);
    // dispatch(setUnplannedCourses(courseCode));
  }

  return (
    <div className='cont'>
      <div className='contents'>
        {
          showAlert && <Alert 
            message={`Yay, you've successfully added ${courseCode} to your planner!` }
            type="success"
            className='alert'
            style={{ marginBottom: '1rem'}}
            showIcon closable
            afterClose={() => setShowAlert(false)}/>
        }
        <div className='description-title'>
          <div>
            <h2 className='code text'>{ courseCode }</h2>
            <h1 className='name text'>{ course.name }</h1>
          </div>
          <Button className='btn' onClick={ addToPlanner } type="primary" icon={<PlusOutlined />}>
            Add to planner
          </Button>
        </div>
        <h3 className='subhead text'>Overview</h3>
        <p className='text'>{ course.overview }</p>
        <h3 className='subhead text'>Prerequisites</h3>
        {
          course.prereq && course.prereq.length > 0 ?
          ( 
            <div className='text flex'>
              { course.prereq.map(courseCode => { return <CourseTag name={courseCode}/> })}
            </div>
          )
          :
          <p className='text'>None</p>
        }
        <h3 className='subhead text'>Unlocks these next courses</h3>
        {
          course.next && course.next.length > 0 ?
          course.next.map(courseCode => {
            <CourseTag name={courseCode}/>
          })
          :
          <p className='text'>None</p>
        }
      </div>
      <div>
        { Object.entries(course.attributes).map(attr => <CourseAttribute header={attr[0]} description={attr[1]}/> )}
        <div className='terms-attribute'>
          <h3 className='subhead text'>Terms Available</h3>
          { course.terms && course.terms.map(term => <Tag className='text'>{ isNaN(term) ? `${term} Term` : `Term ${term}` }</Tag> )}
        </div>
      </div>
    </div>
  );
}