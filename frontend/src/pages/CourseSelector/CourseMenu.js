import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { Menu } from 'antd';
import { courseOptionsActions } from '../../actions/courseOptionsActions';
import axios from 'axios';
import './CourseMenu.less';

const { SubMenu } = Menu;

const MenuItem = ({courseCode}) => {
  const history = useHistory();
  return (
    <Menu.Item 
      className='text'
      key={courseCode}
      onClick={() => history.push(`/course-selector/${courseCode}`)}
    >
      { courseCode }
    </Menu.Item>
  )
}

export default function CourseMenu() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { id } = useParams();
  const courseOptions = useSelector(store => store.courseOptions);

  useEffect(() => {
    getCourseOptions();
  }, []);

  const getCourseOptions = async () => {
    const res = await axios.get('http://localhost:3000/courseOptions.json');
    let core = [];
    let electives = [];
    let genEds = [];
    res.data.courseOptions.map(course => {
      let type = course[Object.keys(course)[0]].type;
      if (type === 'core') {
        core.push(course);
      } else if (type === 'elective') {
        electives.push(course);
      } else if (type === 'gened') {
        genEds.push(course);
      }
    });
    dispatch(courseOptionsActions('SET_RECENTLY_VIEWED_COURSES', res.data.recentlyViewed));
    dispatch(courseOptionsActions('SET_CORE_COURSES', core));
    dispatch(courseOptionsActions('SET_ELECTIVE_COURSES', electives));
    dispatch(courseOptionsActions('SET_GENED_COURSES', genEds));
  }

  const handleClick = e => {
    console.log('click ', e);
  };

  const goToCourse = (id) => {
    history.push(`/course-selector/${id}`);
  }

  return (
    <div className='cs-menu-root'>
      {
        courseOptions.recentlyViewed && courseOptions.core && courseOptions.electives && courseOptions.genEds &&
        <Menu
          className={'text'}
          onClick={handleClick}
          style={{ width: '100%'}}
          defaultSelectedKeys={[id ? id : courseOptions.core[0]]}
          selectedKeys={[id]}
          defaultOpenKeys={['recently-viewed', 'core', 'electives']}
          mode="inline"
          // id={'this'}
        >
          <SubMenu className={"text"} key="recently-viewed" title="Recently Viewed">
            { courseOptions.recentlyViewed.length === 0
              ? <Menu.Item key={'empty-recently-viewed'} disabled> No courses here (ㆆ_ㆆ) </Menu.Item>
              : courseOptions.recentlyViewed.map(course => <MenuItem courseCode={course}/>) 
            }
          </SubMenu>
          <SubMenu  className={"text"} key="core" title="Core">
            { courseOptions.core.length === 0
              ? <Menu.Item key={'empty-core'} disabled> No courses here (ㆆ_ㆆ) </Menu.Item>
              : courseOptions.core.map(course => <MenuItem courseCode={Object.keys(course)[0]}/>) 
            }
          </SubMenu>
          <SubMenu className={"text"} key="electives" title="Electives">
            { courseOptions.electives.length === 0
              ? <Menu.Item key={'empty-electives'} disabled> No courses here (ㆆ_ㆆ) </Menu.Item>
              : courseOptions.electives.map(course => <MenuItem courseCode={Object.keys(course)[0]}/>) 
            }
          </SubMenu>
          <SubMenu  className={"text"} key="general-education" title="General Education">
            { courseOptions.genEds.length === 0
              ? <Menu.Item key={'empty-general-education'} disabled> No courses here (ㆆ_ㆆ) </Menu.Item>
              : courseOptions.genEds.map(course => <MenuItem courseCode={Object.keys(course)[0]}/>) 
            }
          </SubMenu>
        </Menu>
      }
    </div>
  );
}