import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, Tooltip } from "antd";
import { reorderTabs, resetTabs, setActiveTab } from "reducers/courseTabsSlice";
import CourseTab from "./CourseTab";
import "./index.less";

const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs } = useSelector((state) => state.courseTabs);

  const onDragStart = (result) => {
    dispatch(setActiveTab(result.source.index));
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

    dispatch(setActiveTab(result.destination.index));
    dispatch(reorderTabs(reorderedTabs));
  };

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
        !!tabs.length
        && (
          <div className="cs-tabs-close-all">
            <Popconfirm
              placement="bottomRight"
              title="Do you want to close all tabs?"
              onConfirm={() => dispatch(resetTabs())}
              style={{ width: "500px" }}
              okText="Yes"
              cancelText="No"
            >
              <Tooltip title="Close all tabs">
                <DeleteOutlined />
              </Tooltip>
            </Popconfirm>
          </div>
        )
      }
    </div>
  );
};

export default CourseTabs;
