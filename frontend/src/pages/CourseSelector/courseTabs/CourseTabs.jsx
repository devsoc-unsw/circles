import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { courseTabActions } from "../../../actions/courseTabActions";
import "./courseTabs.less";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import CourseTab from "./CourseTab";

export const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs } = useSelector((state) => state.tabs);

  const onDragStart = (result) => {
    dispatch(courseTabActions("SET_ACTIVE_TAB", result.source.index));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return; // dropped outside of tab container

    // function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
    };

    const reorderedTabs = reorder(
      tabs,
      result.source.index,
      result.destination.index
    );

    dispatch(courseTabActions("SET_ACTIVE_TAB", result.destination.index));
    dispatch(courseTabActions("REORDER_TABS", reorderedTabs));
  };

  return (
    <div className="cs-tabs-container">
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(droppableProvided, droppableSnapshot) => (
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
    </div>
  );
};
