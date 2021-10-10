import React from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { Menu } from 'antd';
import { courseTabActions } from '../../../actions/courseTabActions';
import { setStructure } from '../../../actions/setStructure';
import { Loading } from './Loading';
import './CourseMenu.less';

const { SubMenu } = Menu;

const MenuItem = ({courseCode}) => {
  const dispatch = useDispatch();
  const handleClick = () => {
      dispatch(courseTabActions("ADD_TAB", courseCode));
  }
  return (
    <Menu.Item className='text' key={courseCode} onClick={handleClick}>
      { courseCode }
    </Menu.Item>
  )
}

export default function CourseMenu() {
  const dispatch = useDispatch();
  const structure = useSelector(state => state.structure);
  const { active, tabs } = useSelector(state => state.tabs);
  let id = tabs[active];

  // Exception tabs
  if (id === 'explore' || id === 'search') id = null;

  const fetchProgression = async () => {
    // Local Development Testing
    const res = await axios.get('http://localhost:3000/structure.json');
    // Uncomment when DB is working
    // const coreData = await axios.get(`http://localhost:8000/api/getCoreCourses/${programCode}/${specialisation}/${minor}`);
    dispatch(setStructure(res.data));
  }
  if (!structure) fetchProgression();
  return (
    <div className='cs-menu-root'>
      { structure === null 
        ? <Loading />
        : (
          <Menu
            className={'text'}
            onClick={() => {}}
            defaultSelectedKeys={[]}
            selectedKeys={[]}
            defaultOpenKeys={[[...Object.keys(structure)][0]]}
            mode="inline"
          > 
          { [...Object.keys(structure)].map(category => 
              // Major, Minor, General
              <SubMenu key={category} title={category}>
              {/* Business core, Flexible core etc */}
              { Object.keys(structure[category]).map(subCategory => 
                <Menu.ItemGroup key={subCategory} title={subCategory}>
                  { Object.keys(structure[category][subCategory]["courses"]).map(courseCode => 
                    <MenuItem courseCode={courseCode}/>
                    )}
                </Menu.ItemGroup>
              )}
            </SubMenu>
            )}
          </Menu>
      )}
    </div>
  );
}
   