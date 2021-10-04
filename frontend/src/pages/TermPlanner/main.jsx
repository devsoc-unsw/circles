import React, { useState, useEffect } from "react";

import { notification, Tooltip } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import TermBox from "./TermBox";
import SkeletonPlanner from "./SkeletonPlanner";
import "./main.less";
import { useSelector, useDispatch } from "react-redux";
import {
  handleOnDragEnd,
  handleOnDragStart,
  updateWarnings,
} from "./DragDropLogic";
import UnplannedColumn from "./UnplannedColumn";
import OptionsHeader from "./OptionsHeader";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import { IoIosEyeOff } from "react-icons/io";

const TermPlanner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const {
    years,
    startYear,
    numYears,
    courses,
    plannedCourses,
    isSummerEnabled,
  } = useSelector((state) => {
    return state.planner;
  });

  // const theme = useSelector((state) => state.theme);

  // const [visible, setVisible] = useState(false); // visibility for side drawer
  const dispatch = useDispatch();

  const showCannotHideAllYearsNotification = () => {
    notification.open({
      type: "error",
      message: "Something's not right",
      description: "You cannot hide all years in your term planner",
      duration: 2,
    });
  };

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
  const [hidden, setHidden] = React.useState(() => {
    const hiddenMap = new Map();
    for (let i = 0; i < numYears; i++) {
      hiddenMap.set(parseInt(startYear) + parseInt(i), false);
    }
    return hiddenMap;
  });

  const hideYear = (year) => {
    console.log(hideYear);
    const tempHidden = new Map(hidden);
    let i = 0;
    for (const [key, value] of tempHidden.entries()) {
      if (value) i++;
    }
    console.log(i);
    if (i === numYears - 1) {
      showCannotHideAllYearsNotification();
      return;
    }
    tempHidden.set(year, true);
    setHidden(tempHidden);
    setAreYearsHidden(true);
  };

  const unhideAll = () => {
    const tempHidden = new Map(hidden);
    for (const [key, value] of tempHidden.entries()) {
      tempHidden.set(key, false);
      // console.log(key, value);
    }
    setHidden(tempHidden);
    setAreYearsHidden(false);
  };
  const [areYearsHidden, setAreYearsHidden] = React.useState(false);

  return (
    <>
      <OptionsHeader areYearsHidden={areYearsHidden} unhideAll={unhideAll} />
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
          <div className="plannerContainer">
            <div class={`gridContainer ${isSummerEnabled && "summerGrid"}`}>
              <div class="gridItem"></div>
              {isSummerEnabled && <div class="gridItem">Summer</div>}
              <div class="gridItem">Term 1</div>
              <div class="gridItem">Term 2</div>
              <div class="gridItem">Term 3</div>

              {years.map((year, index) => {
                const iYear = parseInt(startYear) + parseInt(index);
                if (!hidden.get(iYear)) {
                  return (
                    <React.Fragment key={index}>
                      <div className={`yearContainer gridItem`}>
                        <div
                          className={`year ${currYear === iYear && "currYear"}`}
                        >
                          {iYear}
                        </div>
                        <Tooltip title="Hide year">
                          <div className="eye" onClick={() => hideYear(iYear)}>
                            <IoIosEyeOff />
                          </div>
                        </Tooltip>
                      </div>

                      {Object.keys(year).map((term) => {
                        const key = iYear + term;
                        if (
                          (!isSummerEnabled && term != "t0") ||
                          isSummerEnabled
                        )
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
                  );
                }
              })}
            </div>
            <UnplannedColumn />
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
