import React, { useState, useEffect } from "react";
import { Button, notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import TermBox from "./TermBox";
import { RightOutlined } from "@ant-design/icons";
import axios from "axios";
import OptionsDrawer from "./OptionsDrawer";
import SkeletonPlanner from "./SkeletonPlanner";
import "./main.less";

// @Sano This needs to be shorter. Manage ur draggable ourside if u can.
// Also u can fetch the data with useSelector(store => store.planner); 
// Checkout the reducer, I tried to make the store similar to ur data.json 
const TermPlanner = () => {
  const [years, setYears] = useState([{}]);
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [unplanned, setUnplanned] = useState({});

  const fetchCourses = async () => {
    const res = await axios.get("data.json");
    setData(res.data);
    setYears(res.data.years);
    setUnplanned(createUnplannedTypes(res.data));
    setIsLoading(false);
    isAllEmpty(years) && openNotification();
  };

  // REVIEW COMMENT: See warning - 'React Hook useEffect has a missing dependency 'fetchCourses.' Either include it or remove the dependency array
  useEffect(() => {
    setTimeout(fetchCourses, 1000); // testing skeleton
    //     fetchCourses();
  }, []);

  const handleOnDragEnd = (result) => {
    setIsDragging(false);

    const { destination, source, draggableId } = result;
    let newYears = [...years];

    if (!destination) return; // drag outside container
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      // drag to same place
      return;

    const destYear = destination.droppableId.match(/[0-9]{4}/)[0];
    const destTerm = destination.droppableId.match(/t[1-3]/)[0];
    const destIndex = destYear - data.startYear;
    const destBox = years[destIndex][destTerm];

    // === move unplanned course to term ===
    if (source.droppableId.match(/[0-9]{4}/) === null) {
      // updated unplanned list
      const type = source.droppableId;
      const code = unplanned[type][source.index];
      const unplannedCpy = Object.assign({}, unplanned);
      unplannedCpy[type] = unplannedCpy[type].filter(
        (course) => course !== code
      );
      setUnplanned(unplannedCpy);

      // update destination term box
      const destCoursesCpy = Array.from(years[destIndex][destTerm]);
      destCoursesCpy.splice(destination.index, 0, draggableId);
      newYears[destIndex][destTerm] = destCoursesCpy;
      setYears(newYears);
      return;
    }

    const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
    const srcTerm = source.droppableId.match(/t[1-3]/)[0];
    const srcIndex = srcYear - data.startYear;
    const srcBox = years[srcIndex][srcTerm];

    // === move within one term ===
    if (srcBox === destBox) {
      const alteredBox = Array.from(srcBox);
      alteredBox.splice(source.index, 1);
      alteredBox.splice(destination.index, 0, draggableId);
      newYears[srcIndex][srcTerm] = alteredBox;
      setYears(newYears);
      return;
    }

    // === move from one term to another ===
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
        <div className="plannerContainer">
          <SkeletonPlanner />
        </div>
      ) : (
        <DragDropContext
          onDragEnd={handleOnDragEnd}
          onDragStart={handleOnDragStart}
        >
          <div className="plannerContainer">
            <Button
              type="primary"
              icon={<RightOutlined />}
              onClick={() => setVisible(true)}
              shape="circle"
              ghost
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
              data={data}
              unplanned={unplanned}
            />
          </div>
        </DragDropContext>
      )}
    </>
  );
};

const openNotification = () => {
  const args = {
    message: "Your terms are looking a little empty",
    description:
      "Open the sidebar on the left to reveal courses that you've added from the course selector",
    duration: 10,
    className: "text helpNotif",
    placement: "topRight",
  };
  notification["info"](args);
};

// create separate array for each type
// e.g. courseTypes = { Core: ["COMP1511", "COMP2521"], Elective: ["COMP6881"] }
const createUnplannedTypes = (data) => {
  if (data["unplanned"] == null) return {};
  let courseTypes = {};
  data["unplanned"].forEach((code) => {
    const type = data["courses"][code]["type"];
    if (!courseTypes.hasOwnProperty(type)) {
      courseTypes[type] = [code];
    } else {
      courseTypes[type].push(code);
    }
  });
  return courseTypes;
};

// checks if no courses have been planned (to display help notification)
const isAllEmpty = (years) => {
  for (const year of years) {
    var termEmpty = Object.keys(year).every((key) => year[key].length === 0);
    if (!termEmpty) return false;
  }
  return true;
};

export default TermPlanner;