import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
// import { getAllCourses } from '../../actions/updateCourses';
import { Menu } from 'antd';

const { SubMenu } = Menu;

export default function CourseMenu(props) {
  const history = useHistory();
  // const dispatch = useDispatch();
  // const courses = useSelector(state => state.updateCourses.courses);
  const [core, setCore] = useState([]);
  const [electives, setElectives] = useState([]);
  const [genEd, setGenEd] = useState([]);
  const [courseId, setCourseId] = useState('');

  useEffect(() => {
    setCourseId(props.courseId);
  }, [props.courseId]);

  // useEffect(() => {
  //   console.log('COURSE MENU');
  //   dispatch(getAllCourses());
  // }, []);

  useEffect(() => {
    setCore([]);
    setElectives([]);
    setGenEd([]);
    let currCore = [...core];
    let currElec = [...electives];
    let currGenEd = [...genEd];
    for (const course in props.courses) {
      if (props.courses[course].type === 'core') {
        currCore.push(course);
      } else if (props.courses[course].type === 'elective') {
        currElec.push(course);
      } else if (props.courses[course].type === 'gened') {
        currGenEd.push(course);
      }
    };
    setCore(currCore);
    setElectives(currElec);
    setGenEd(currGenEd);
    // REVIEW COMMENT: See warning - you have missing dependencies
  }, [props.courses]);

  const handleClick = e => {
    console.log('click ', e);
  };

  const goToCourse = (id) => {
    history.push(`/course-selector/${id}`);
  }

  return (
    <>
      {
        courseId && core.length > 0 && electives.length > 0 && genEd.length > 0 &&
        <Menu
          className={'text'}
          onClick={handleClick}
          style={{ width: '100%', color: 'black'}}
          defaultSelectedKeys={[courseId !== '0' ? courseId : core[0]]}
          selectedKeys={[courseId]}
          defaultOpenKeys={['sub2', 'sub4', 'sub5']}
          mode="inline"
        >
          <SubMenu className={"text"} key="sub1" /* icon={<MailOutlined />} */ title="Recently Viewed">
            <Menu.Item key={'0'} disabled>No courses here (ㆆ_ㆆ)</Menu.Item>
          </SubMenu>
          <SubMenu  className={"text"} key="sub2" /* icon={<AppstoreOutlined />} */ title="Core">
            {
              core.map((course) => {
                return (
                  <Menu.Item className={"text"}  key={ course } onClick={ () => goToCourse(course) }>{ course }</Menu.Item>
                )
              })
            }
          </SubMenu>
          <SubMenu className={"text"} key="sub4" /* icon={<SettingOutlined />} */ title="Electives">
            {
              electives.map((course) => {
                return (
                  <Menu.Item className={"text"} key={ course } onClick={ () => goToCourse(course) }>{ course }</Menu.Item>
                )
              })
            }
          </SubMenu>
          <SubMenu  className={"text"} key="sub5" /* icon={<SettingOutlined />} */ title="General Education">
            {
              genEd.map((course) => {
                return (
                  <Menu.Item  className={"text"} key={ course } onClick={ () => goToCourse(course) }>{ course }</Menu.Item>
                )
              })
            }
          </SubMenu>
        </Menu>
      }
    </>
  );
}