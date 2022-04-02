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

  const handleEdit = (index, action) => {
    if (action === "add") {
      dispatch(courseTabActions("ADD_TAB", "search"));
    } else if (action === "remove") {
      dispatch(courseTabActions("REMOVE_TAB", index));
    }
  };

  // a little function to help us with reordering the result
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const getStyle = (style, snapshot) => {
    if (style.transform) {
      const axisLockX = `${style.transform.split(",").shift()}, 0px)`;
      return {
        ...style,
        transform: axisLockX,
      };
    }
    return style;
  };

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedTabs = reorder(
      tabs,
      result.source.index,
      result.destination.index
    );
    handleChange(result.destination.index);
    dispatch(courseTabActions("REORDER_TABS", reorderedTabs));
  };

  return (
    <div className="cs-tabs-container">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(droppableProvided, droppableSnapshot) => (
            <div
              ref={droppableProvided.innerRef}
              // style={getListStyle(snapshot.isDraggingOver)}
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
                      style={getStyle(
                        draggableProvided.draggableProps.style,
                        draggableSnapshot
                      )}
                      // style={getItemStyle(
                      //   snapshot.isDragging,
                      //   provided.draggableProps.style
                      // )}
                    >
                      <span className="cs-tab-name">{tab}</span>
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined style={{ fontSize: "12px" }} />}
                        onClick={() => handleEdit(index, "remove")}
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
