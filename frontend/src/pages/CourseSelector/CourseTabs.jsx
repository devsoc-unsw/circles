import React from "react";
import { Button } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { courseTabActions } from "../../actions/courseTabActions";
import "./courseTabs.less";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CloseOutlined } from "@ant-design/icons";

export const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs, active } = useSelector((state) => state.tabs);
  const handleChange = (activeKey) => {
    dispatch(courseTabActions("SET_ACTIVE_TAB", activeKey));
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

    handleChange(result.destination.index); // set active tab to dragged tab
    dispatch(courseTabActions("REORDER_TABS", reorderedTabs));
  };

  const getDraggableStyle = (style, snapshot) => {
    // lock x axis when dragging
    if (style.transform) {
      const axisLockX = `${style.transform.split(",").shift()}, 0px)`;
      return {
        ...style,
        transform: axisLockX,
      };
    }
    return style;
  };

  return (
    <div className="cs-tabs-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(droppableProvided, droppableSnapshot) => (
            <div
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
              className="cs-tabs-root"
            >
              {tabs.map((tab, index) => (
                <Draggable key={tab} draggableId={tab} index={index}>
                  {(draggableProvided, draggableSnapshot) => (
                    <div
                      className={index === active ? "cs-tab active" : "cs-tab"}
                      onClick={() => handleChange(index)}
                      ref={draggableProvided.innerRef}
                      {...draggableProvided.draggableProps}
                      {...draggableProvided.dragHandleProps}
                      style={getDraggableStyle(
                        draggableProvided.draggableProps.style,
                        draggableSnapshot
                      )}
                    >
                      <span className="cs-tab-name">{tab}</span>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined style={{ fontSize: "12px" }} />}
                        onClick={(e) => {
                          e.stopPropagation(); // stop propagation for above tab onclick event
                          dispatch(courseTabActions("REMOVE_TAB", index));
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {droppableProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
