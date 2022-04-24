import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import courseTabActions from "../../../actions/courseTabActions";
import "./courseTabs.less";
import CourseTab from "./CourseTab";
import { Button, Dropdown, Menu } from "antd";
import { CloseOutlined, EllipsisOutlined } from "@ant-design/icons";

const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs } = useSelector((state) => state.tabs);

  const onDragStart = (result) => {
    dispatch(courseTabActions("SET_ACTIVE_TAB", result.source.index));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return; // dropped outside of tab container

    // function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
      const r = Array.from(list);
      const [removed] = r.splice(startIndex, 1);
      r.splice(endIndex, 0, removed);

      return r;
    };

    const reorderedTabs = reorder(
      tabs,
      result.source.index,
      result.destination.index,
    );

    dispatch(courseTabActions("SET_ACTIVE_TAB", result.destination.index));
    dispatch(courseTabActions("REORDER_TABS", reorderedTabs));
  };

  const TabDropdownMenu = (
    <Menu>
      <Menu.Item
        onClick={() => dispatch(courseTabActions("RESET_COURSE_TABS"))}
        style={{color: '#D11A2A'}}
      >
        <CloseOutlined /> Close all tabs
      </Menu.Item>
    </Menu>
  );
  

  return (
    <div className="cs-tabs-cont">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(droppableProvided, _) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              className="cs-tabs-root"
            >
              {tabs.map((tab, index) => (
                <CourseTab tab={tab} index={index} />
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {
        !!tabs.length &&
        <Dropdown overlay={TabDropdownMenu}>
          <Button className="cs-tabs-dropdown-btn" icon={<EllipsisOutlined />}/>
        </Dropdown>
      }
    </div>
  );
};

export default CourseTabs;
