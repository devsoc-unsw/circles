import React from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { DeleteOutlined } from "@ant-design/icons";
import { Popconfirm, Tooltip, Switch } from "antd";
import DraggableTab from "components/DraggableTab";
import { reorderTabs, resetTabs, setActiveTab } from "reducers/courseTabsSlice";
import { toggleLockedCourses } from "reducers/settingsSlice";
import S from "./styles";

const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs } = useSelector((state) => state.courseTabs);
  const { showLockedCourses } = useSelector((state) => state.settings);

  const onDragStart = (result) => {
    dispatch(setActiveTab(result.source.index));
  };

  const onDragEnd = (result) => {
    // dropped outside of tab container
    if (!result.destination) return;

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
    <S.CourseTabsWrapper>
      <S.ShowAllCourses>
        <S.TextShowCourses>
          Show all courses
        </S.TextShowCourses>
        <Switch
          size="small"
          defaultChecked={showLockedCourses}
          onChange={() => dispatch(toggleLockedCourses())}
        />
      </S.ShowAllCourses>
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
