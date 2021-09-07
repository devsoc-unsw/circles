import React, { useState, useEffect } from "react";

import { Button, notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import TermBox from "./TermBox";
import { RightOutlined } from "@ant-design/icons";
import OptionsDrawer from "./OptionsDrawer";
import SkeletonPlanner from "./SkeletonPlanner";
import "./main.less";
import { useSelector, useDispatch } from "react-redux";
import {
  handleOnDragEnd,
  handleOnDragStart,
  updateWarnings,
} from "./DragDropLogic";

const TermPlanner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const { years, startYear, courses, plannedCourses, isSummerEnabled } =
    useSelector((state) => {
      return state.planner;
    });
  const [visible, setVisible] = useState(false); // visibility for side drawer
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(false);
    isAllEmpty(years) && openNotification();
    updateWarnings(years, startYear, courses, dispatch);
  }, []);
  const currYear = new Date().getFullYear();

  const dragEndProps = {
    setIsDragging,
    dispatch,
    years,
    startYear,
    plannedCourses,
    courses,
  };

  return (
    <>
      {isLoading ? (
        <SkeletonPlanner />
      ) : (
        <DragDropContext
          onDragEnd={(result) => {
            handleOnDragEnd(result, dragEndProps);
            updateWarnings(years, startYear, courses, dispatch);
          }}
          onDragStart={(result) =>
            handleOnDragStart(result, courses, setTermsOffered, setIsDragging)
          }
        >
          <Button
            type="primary"
            icon={<RightOutlined />}
            onClick={() => setVisible(true)}
            shape="circle"
            ghost
            style={{ position: "sticky", top: "50vh", left: "1em" }}
          />
          <div className="plannerContainer">
            <div class={`gridContainer ${isSummerEnabled && "summerGrid"}`}>
              <div class="gridItem"></div>
              {isSummerEnabled && <div class="gridItem">Summer Term</div>}
              <div class="gridItem">Term 1</div>
              <div class="gridItem">Term 2</div>
              <div class="gridItem">Term 3</div>

              {years.map((year, index) => (
                <React.Fragment key={index}>
                  <div
                    class={`gridItem ${
                      currYear === startYear + index && "currYear"
                    }`}
                  >
                    {startYear + index}
                  </div>
                  {Object.keys(year).map((term) => {
                    const key = startYear + index + term;
                    if ((!isSummerEnabled && term != "t0") || isSummerEnabled)
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
            <OptionsDrawer visible={visible} setVisible={setVisible} />
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

// checks if no courses have been planned (to display help notification)
const isAllEmpty = (years) => {
  for (const year of years) {
    var termEmpty = Object.keys(year).every((key) => year[key].length === 0);
    if (!termEmpty) return false;
  }
  return true;
};

export default TermPlanner;
