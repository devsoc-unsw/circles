import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import courseTabActions from "../../../actions/courseTabActions";
import "./courseTabs.less";
import CourseTab from "./CourseTab";

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
    </div>
  );
};

export default CourseTabs;
