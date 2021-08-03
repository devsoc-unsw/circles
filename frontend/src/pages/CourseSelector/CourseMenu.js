import React, { useState, useEffect } from 'react';
// import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
// import { getAllCourses } from '../../actions/updateCourses';
import { Menu } from 'antd';
import './CourseMenu.less';

const { SubMenu } = Menu;

export default function CourseMenu(props) {
  const history = useHistory();
  const { id } = useParams();
  // const dispatch = useDispatch();
  // const courses = useSelector(state => state.updateCourses.courses);
  const [core, setCore] = useState([]);
  const [electives, setElectives] = useState([]);
  const [genEd, setGenEd] = useState([]);

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
    <div className='cs-menu-root'>
      {
        core.length > 0 && electives.length > 0 && genEd.length > 0 &&
        <Menu
          className={'text'}
          onClick={handleClick}
          style={{ width: '100%', color: 'black'}}
          defaultSelectedKeys={[id !== '0' ? id : core[0]]}
          selectedKeys={[id]}
          defaultOpenKeys={['sub2', 'sub4', 'sub5']}
          mode="inline"
          id={'this'}
        >
          <SubMenu className={"text"} key="sub1" /* icon={<MailOutlined />} */ title="Recently Viewed">
            <Menu.Item key={'0'} disabled className="text">No courses here (ㆆ_ㆆ)</Menu.Item>
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
    </div>
  );
}