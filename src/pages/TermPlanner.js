import React from "react";

import { Card, Progress, Typography, Tag, Button, Divider } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "../components/TermPlanner/DraggableCourse";
import TermBox from "../components/TermPlanner/TermBox";

function TermPlanner() {
  const { Title, Text } = Typography;

  const data = {
    courses: {
      COMP3333: "Extended algorithms and programming techniques",
      ARTS4268:
        "Methodologies in the Social Sciences: Questions and Quandaries",
      COMP1511: "Programming Fundamentals",
      CHEM1011: "Chemistry 1A",
      MATH1131: "Mathematics 1A",
      BIOC2201: "Biochemistry",
      ENGG1000: "Introduction to Engineering Design and Innovation",
      COMP2041: "Software Construction: Techniques and Tools",
    },

    startYear: 2021,
    numYears: 3,
    years: [
      {
        t1: ["COMP3333", "COMP1511"],
        t2: ["ARTS4268"],
        t3: ["CHEM1011"],
      },
      { t1: ["MATH1131"], t2: ["BIOC2201"], t3: [] },
      { t1: ["COMP2041"], t2: [], t3: ["ENGG1000"] },
    ],
  };
  const [years, setYears] = React.useState(data.years);

  const handleOnDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return; // drag outside of droppable area
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      // drag to same place
      return;

    const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
    const srcTerm = source.droppableId.match(/t[1-3]/)[0];
    const srcIndex = srcYear - data.startYear;
    const srcBox = years[srcIndex][srcTerm];

    const destYear = destination.droppableId.match(/[0-9]{4}/)[0];
    const destTerm = destination.droppableId.match(/t[1-3]/)[0];
    const destIndex = destYear - data.startYear;
    const destBox = years[destIndex][destTerm];

    let newYears = [...years];

    // === move within one list ===
    if (srcBox == destBox) {
      const alteredBox = Array.from(srcBox);
      alteredBox.splice(source.index, 1);
      alteredBox.splice(destination.index, 0, draggableId);
      newYears[srcIndex][srcTerm] = alteredBox;
      setYears(newYears);
      return;
    }

    // === move from one list to another ===
    const srcCoursesCpy = Array.from(years[srcIndex][srcTerm]);
    srcCoursesCpy.splice(source.index, 1);

    const destCoursesCpy = Array.from(years[destIndex][destTerm]);
    destCoursesCpy.splice(destination.index, 0, draggableId);

    newYears[srcIndex][srcTerm] = srcCoursesCpy;
    newYears[destIndex][destTerm] = destCoursesCpy;

    setYears(newYears);
  };

  return (
    <>
      <Title style={{ marginLeft: "1em" }} className="text">
        Computer Science/Arts
      </Title>
      <Divider />
      <div class="gridContainer">
        <div class="gridItem"></div>
        <div class="gridItem">Term 1</div>
        <div class="gridItem">Term 2</div>
        <div class="gridItem">Term 3</div>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          {years.map((year, index) => (
            <React.Fragment key={index}>
              <div class="gridItem">{data.startYear + index}</div>
              <TermBox
                name={data.startYear + index + "t1"}
                courses={year.t1}
                courseNames={data.courses}
              />
              <TermBox
                name={data.startYear + index + "t2"}
                courses={year.t2}
                courseNames={data.courses}
              />
              <TermBox
                name={data.startYear + index + "t3"}
                courses={year.t3}
                courseNames={data.courses}
              />
            </React.Fragment>
          ))}
        </DragDropContext>
      </div>
    </>
  );
}

export default TermPlanner;
