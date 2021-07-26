import React, { useState, useEffect } from "react";

import { Button, notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import TermBox from "./TermBox";
import { RightOutlined } from "@ant-design/icons";
import axios from "axios";
import OptionsDrawer from "./OptionsDrawer";
import SkeletonPlanner from "./SkeletonPlanner";
import "./main.less";
import { useSelector, useDispatch } from "react-redux";
import { plannerActions } from "../../actions/plannerActions";

const TermPlanner = () => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [unplanned, setUnplanned] = useState({});
  const { years, startYear, courses } = useSelector((state) => {
    return state.planner;
  });
  console.log(courses.get("DEFAULT1000"));

  const dispatch = useDispatch();
  const fetchCourses = async () => {
    const res = await axios.get("data.json");
    setData(res.data);
    //     setYears(res.data.years);
    setUnplanned(createUnplannedTypes(res.data));
    setIsLoading(false);
    isAllEmpty(years) && openNotification();
  };

  useEffect(() => {
    setTimeout(fetchCourses, 1000); // testing skeleton
  }, []);

  // visibility for side drawer
  const [visible, setVisible] = useState(false);

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
    const destRow = destYear - startYear;
    const destBox = years[destRow][destTerm];

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
      const destCoursesCpy = Array.from(years[destRow][destTerm]);
      destCoursesCpy.splice(destination.index, 0, draggableId);
      newYears[destRow][destTerm] = destCoursesCpy;
      dispatch(plannerActions("SET_YEARS", newYears));
      return;
    }

    const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
    const srcTerm = source.droppableId.match(/t[1-3]/)[0];
    const srcRow = srcYear - startYear;
    const srcBox = years[srcRow][srcTerm];

    // === move within one term ===
    if (srcBox === destBox) {
      const alteredBox = Array.from(srcBox);
      alteredBox.splice(source.index, 1);
      alteredBox.splice(destination.index, 0, draggableId);
      newYears[srcRow][srcTerm] = alteredBox;
      dispatch(plannerActions("SET_YEARS", newYears));
      return;
    }

    // === move from one term to another ===
    const srcCoursesCpy = Array.from(years[srcRow][srcTerm]);
    srcCoursesCpy.splice(source.index, 1);

    const destCoursesCpy = Array.from(years[destRow][destTerm]);
    destCoursesCpy.splice(destination.index, 0, draggableId);

    newYears[srcRow][srcTerm] = srcCoursesCpy;
    newYears[destRow][destTerm] = destCoursesCpy;

    dispatch(plannerActions("SET_YEARS", newYears));
  };

  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const handleOnDragStart = (courseItem) => {
    setIsDragging(true);
    const course = courseItem.draggableId;
    const terms = courses.get(course)["termsOffered"];
    setTermsOffered(terms);
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPlanner />
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
                  <div class="gridItem">{startYear + index}</div>
                  {Object.keys(year).map((term) => {
                    const key = startYear + index + term;
                    return (
                      <TermBox
                        key={key}
                        name={key}
                        courses={year[term]}
                        termsOffered={termsOffered}
                        isDragging={isDragging}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <OptionsDrawer
              visible={visible}
              setVisible={setVisible}
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
