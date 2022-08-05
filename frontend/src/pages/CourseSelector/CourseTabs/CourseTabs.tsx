import React from "react";
import { DragDropContext, Droppable, OnDragEndResponder, OnDragStartResponder } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, Tooltip } from "antd";
import DraggableTab from "components/DraggableTab";
import { RootState } from "config/store";
import { reorderTabs, resetTabs, setActiveTab } from "reducers/courseTabsSlice";
import S from "./styles";

const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs } = useSelector((state: RootState) => state.courseTabs);

  const onDragStart: OnDragStartResponder = (result) => {
    dispatch(setActiveTab(result.source.index));
  };

  const onDragEnd: OnDragEndResponder = (result) => {
    // dropped outside of tab container
    if (!result.destination) return;

    // reorder tabs logic
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    const reorderedTabs = Array.from(tabs);
    const [removed] = reorderedTabs.splice(startIndex, 1);
    reorderedTabs.splice(endIndex, 0, removed);

    dispatch(setActiveTab(endIndex));
    dispatch(reorderTabs(reorderedTabs));
  };

  return (
    <S.CourseTabsWrapper>
      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(droppableProvided, _) => (
            <S.CourseTabsSection
              ref={droppableProvided.innerRef}
              {...droppableProvided.droppableProps}
            >
              {tabs.map((tab, index) => (
                <DraggableTab tabName={tab} index={index} />
              ))}
              {droppableProvided.placeholder}
            </S.CourseTabsSection>
          )}
        </Droppable>
      </DragDropContext>
      {
        !!tabs.length
        && (
          <S.TabsCloseAll>
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
          </S.TabsCloseAll>
        )
      }
    </S.CourseTabsWrapper>
  );
};

export default CourseTabs;
