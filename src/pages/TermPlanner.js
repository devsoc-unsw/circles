import React from "react";

import { Card, Progress, Typography, Tag, Button } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "../components/TermPlanner/DraggableCourse";

function TermPlanner() {
  const { Title, Text } = Typography;

  const data = [
    "COMP3333: Extended algorithms and programming techniques",
    "ARTS4268: Methodologies in the Social Sciences: Questions and Quandaries",
    "COMP1511: Programming Fundamentals",
  ];

  const [courses, setCourses] = React.useState(data);

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(courses);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCourses(items);
  };

  return (
    <div class="gridContainer">
      <div class="gridItem"></div>
      <div class="gridItem">Term 1</div>
      <div class="gridItem">Term 2</div>
      <div class="gridItem">Term 3</div>

      <div class="gridItem">2021</div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="droppableArea">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              class="termBubble"
            >
              {courses.map((course, index) => (
                <DraggableCourse course={course} index={index} />
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div class="termBubble">
        <div className="course">
          COMP3333: Extended algorithms and programming techniques
        </div>
      </div>
      <div class="termBubble"></div>

      <div class="gridItem">2022</div>
      <div class="termBubble"></div>
      <div class="termBubble"></div>
      <div class="termBubble"></div>
    </div>
  );
}

export default TermPlanner;
