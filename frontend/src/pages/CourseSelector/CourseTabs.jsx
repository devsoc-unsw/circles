import React from 'react';
import { Tabs } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { courseTabActions } from '../../actions/courseTabActions';
import './courseTabs.less';

const { TabPane } = Tabs;
export const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs, active } = useSelector(state => state.tabs);
  console.log(active);
  
  const handleChange = (activeKey) => {
      dispatch(courseTabActions('SET_ACTIVE_TAB', activeKey))
  };

  const handleEdit = (index, action) => {
    if (action === 'add') { 
      dispatch(courseTabActions('ADD_TAB', 'search'));
      dispatch(courseTabActions('SET_ACTIVE_TAB', 'search'));
    } else if (action === 'remove') {
      dispatch(courseTabActions('REMOVE_TAB', index))
    }
  };

  return (
    <Tabs
      className='cs-tabs-root'
      type="editable-card"
      onChange={handleChange}
      activeKey={0} 
      onEdit={handleEdit}
    >
      {tabs.map((tab, key) => (
        <TabPane tab={tab} key={key} closable={!(tab === 'explore')}/>
      ))}
    </Tabs>
  );

}
