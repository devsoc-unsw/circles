import React, { useState, useEffect } from "react";

import { Typography, Button, Drawer, Collapse } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import DraggableCourse from "../components/TermPlanner/DraggableCourse";
import TermBox from "../components/TermPlanner/TermBox";
import { RightOutlined } from "@ant-design/icons";
import axios from "axios";
import OptionsDrawer from "../components/TermPlanner/OptionsDrawer";

const TermPlanner = () => {
  const [years, setYears] = useState([{}]);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    const res = await axios.get("data.json");
    setData(res.data);
    setYears(res.data.years);
    setIsLoading(false);
  };

  useEffect(() => {
    // setTimeout(fetchDegree, 2000);  // testing skeleton
    fetchCourses();
  }, []);
  console.log(data);

  const handleOnDragEnd = (result) => {
    setIsDragging(false);

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

  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const handleOnDragStart = (courseItem) => {
    setIsDragging(true);
    const course = courseItem.draggableId;
    const terms = data.courses[course]["termsOffered"];
    setTermsOffered(terms);
  };

  const [visible, setVisible] = useState(false);

  return (
    <>
      {isLoading ? (
        <>loading</>
      ) : (
        <DragDropContext
          onDragEnd={handleOnDragEnd}
          onDragStart={handleOnDragStart}
        >
          <div className="container">
            <Button
              icon={<RightOutlined />}
              ghost
              onClick={() => setVisible(true)}
              shape="circle"
            />
            <div class="gridContainer">
              <div class="gridItem"></div>
              <div class="gridItem">Term 1</div>
              <div class="gridItem">Term 2</div>
              <div class="gridItem">Term 3</div>

              {years.map((year, index) => (
                <React.Fragment key={index}>
                  <div class="gridItem">{data.startYear + index}</div>
                  {Object.keys(year).map((term) => (
                    <TermBox
                      key={data.startYear + index + term}
                      name={data.startYear + index + term}
                      courses={year[term]}
                      courseNames={data.courses}
                      termsOffered={termsOffered}
                      isDragging={isDragging}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
            <OptionsDrawer
              visible={visible}
              setVisible={setVisible}
              courses={data["courses"]}
            />
          </div>
        </DragDropContext>
      )}
    </>
  );
};

export default TermPlanner;
