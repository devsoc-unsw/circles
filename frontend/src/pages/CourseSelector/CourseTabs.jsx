import React from 'react';
import { Tabs } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { courseTabActions } from '../../actions/courseTabActions';
import './courseTabs.less';

const { TabPane } = Tabs;
export const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs, active } = useSelector(state => state.tabs);
  const handleChange = (activeKey) => {
    dispatch(courseTabActions("SET_ACTIVE_TAB", activeKey));
  };

  const handleEdit = (index, action) => {
    if (action === 'add') { 
      dispatch(courseTabActions('ADD_TAB', 'search'));
    } else if (action === 'remove') {
      dispatch(courseTabActions('REMOVE_TAB', index));
    }
  };

  return (
    <div className='cs-tabs-root'>
      {/* Placeholder div !!DO NOT DELETE */}
      <div></div>
      <Tabs
        type="editable-card"
        onChange={handleChange}
        // activeKey={active} 
        onEdit={handleEdit}
      >
        {tabs.map((tab, key) => (
          <TabPane 
            tab={tab} key={key} 
            className={key === active && 'cs-tabs-root-active'} 
            closable={!(tab === 'explore')}
          />
        ))}
      </Tabs>
    </div>
  );

}
