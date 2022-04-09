import React, { useState, useEffect, useRef } from "react";
import { notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import TermBox from "./TermBox";
import SkeletonPlanner from "./misc/SkeletonPlanner";
import "./main.less";
import { useSelector, useDispatch } from "react-redux";
import { handleOnDragEnd, handleOnDragStart } from "./DragDropLogic";
import { updateAllWarnings } from "./ValidateTermPlanner";
import UnplannedColumn from "./UnplannedColumn";
import OptionsHeader from "./optionsHeader/main";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import HideYearTooltip from "./HideYearTooltip";

const TermPlanner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const {
    years,
    startYear,
    courses,
    plannedCourses,
    isSummerEnabled,
    completedTerms,
    hidden,
    areYearsHidden,
  } = useSelector((state) => state.planner);

  const { programCode, specialisation, minor } = useSelector(
    (state) => state.degree,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    setIsLoading(false);
    isAllEmpty(years) && openNotification();
    updateAllWarnings(dispatch, { years, startYear, completedTerms }, { programCode, specialisation, minor });
  }, [years, dispatch, startYear, completedTerms, programCode, specialisation, minor]);
  const currYear = new Date().getFullYear();

  const dragEndProps = {
    setIsDragging,
    dispatch,
    years,
    startYear,
    plannedCourses,
    courses,
    completedTerms,
  };

  const plannerPic = useRef();

  return (
    <div className="mainContainer">
      <OptionsHeader
        areYearsHidden={areYearsHidden}
        plannerRef={plannerPic}
        isAllEmpty={isAllEmpty}
      />
      {isLoading ? (
        <SkeletonPlanner />
      ) : (
        <DragDropContext
          onDragEnd={(result) => {
            handleOnDragEnd(result, dragEndProps);
            updateAllWarnings(dispatch, { years, startYear, completedTerms }, { programCode, specialisation, minor });
          }}
          onDragStart={(result) => handleOnDragStart(result, courses, setTermsOffered, setIsDragging)}
        >
          <div className="plannerContainer">
            <div
              className={`gridContainer ${isSummerEnabled && "summerGrid"}`}
              ref={plannerPic}
            >
              <div className="gridItem" />
              {isSummerEnabled && <div className="gridItem">Summer</div>}
              <div className="gridItem">Term 1</div>
              <div className="gridItem">Term 2</div>
              <div className="gridItem">Term 3</div>

              {years.map((year, index) => {
                const iYear = parseInt(startYear) + parseInt(index);
                return (!hidden[iYear])
                  ? (
                    <React.Fragment key={index}>
                      <div className="yearContainer gridItem">
                        <div
                          className={`year ${currYear === iYear && "currYear"}`}
                        >
                          {iYear}
                        </div>
                        <HideYearTooltip year={iYear} />
                      </div>

                      {Object.keys(year).map((term) => {
                        const key = iYear + term;
                        return ((!isSummerEnabled && term !== "T0")
                          || isSummerEnabled)
                          ? (
                            <TermBox
                              key={key}
                              name={key}
                              courses={year[term]}
                              termsOffered={termsOffered}
                              isDragging={isDragging}
                            />
                          ) : <></>;
                      })}
                    </React.Fragment>
                  ) : <></>;
              })}
            </div>
            <UnplannedColumn />
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

const openNotification = () => {
  const args = {
    message: "Your terms are looking a little empty",
    description: "Add courses from the course selector to the term planner",
    duration: 3,
    className: "text helpNotif",
    placement: "topRight",
  };
  notification.info(args);
};

// checks if no courses have been planned (to display help notification
// & determine if unschedule all button available)
const isAllEmpty = (years) => {
  for (const year of years) {
    const termEmpty = Object.keys(year).every((key) => year[key].length === 0);
    if (!termEmpty) return false;
  }
  return true;
};

export default TermPlanner;
