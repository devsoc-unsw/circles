import React, { useState, useEffect } from 'react';
import { useParams, useHistory, useRouteMatch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CourseList from './CourseList';
import { getCourseById } from '../../actions/updateCourses';
import classes from './CourseDescription.module.css';

export default function CourseDescription(props) {
  console.log(useRouteMatch())
  const { id } = useParams();
  const dispatch = useDispatch();
  const course = useSelector(state => state.updateCourses.course);
  const [prereq, setPrereq] = useState(['COMP1511', 'DPST1091', 'COMP1917', 'COMP1921']);
  const [nextCourses, setNextCourses] = useState(['COMP2511']);
  const [terms, setTerms] = useState([1, 3]);

  useEffect(() => {
    console.log("GET ID", id)
    dispatch(getCourseById(id));
  }, []);
  
  return (
    <div className={ classes.cont }>
      ID: {id}
      <div>
        {JSON.stringify(course)}
        <div className={ classes.contents }>
          <div className={ classes.top }>
            <div>
              <h2 className={ classes.code }>COMP1531</h2>
              <h1 className={ classes.name }>Introduction to Software Design</h1>
            </div>
            <Button className={ classes.btn } type="primary" icon={<PlusOutlined />}>
              Add to planner
            </Button>
          </div>
          <h3 className={ classes.subhead }>Overview</h3>
          <p>This course provides an introduction to software engineering principles: basic software lifecycle concepts, modern development methodologies, conceptual modeling and how these activities relate to programming. It also introduces the basic notions of team-based project management via conducting a project to design, build and deploy a simple web-based application. It is typically taken in the term after completing COMP1511, but could be delayed and taken later. It provides essential background for the teamwork and project management required in many later courses.</p>
          <h3 className={ classes.subhead }>Prerequisites</h3>
          <CourseList data={ prereq }/>
          <h3 className={ classes.subhead }>Unlocks these next courses</h3>
          <CourseList data={ nextCourses }/>
        </div>
        <div>
          <h3 className={ classes.subhead }>Faculty</h3>
          <p>Faculty of Engineering</p>
          <h3 className={ classes.subhead }>School</h3>
          <p>School of Computer Science and Engineering</p>
          <h3 className={ classes.subhead }>Study Level</h3>
          <p>Undergraduate</p>
          <h3 className={ classes.subhead }>Offering Terms</h3>
          <div className={ classes.list }>
            {
              terms.map(term => {
                return (
                  <Tag>{ isNaN(term) ? `${term} Term` : `Term ${term}` }</Tag>
                )
              })
            }
          </div>
          <h3 className={ classes.subhead }>Campus</h3>
          <p>Kensington</p>
        </div>
      </div>
    </div>
  );
}