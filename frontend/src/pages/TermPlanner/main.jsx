import React, { useState, useEffect, useRef } from "react";
import { notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";
import TermBox from "./TermBox";
import SkeletonPlanner from "./misc/SkeletonPlanner";
import "./main.less";
import { handleOnDragEnd, handleOnDragStart } from "./DragDropLogic";
import updateAllWarnings from "./ValidateTermPlanner";
import UnplannedColumn from "./UnplannedColumn";
import OptionsHeader from "./optionsHeader/main";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import HideYearTooltip from "./HideYearTooltip";

// checks if no courses have been planned (to display help notification
// & determine if unschedule all button available)
const isAllEmpty = (years) => (
  years.every((year) => Object.keys(year).every((key) => year[key].length === 0))
);

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
    if (isAllEmpty(years)) openNotification();
    updateAllWarnings(
      dispatch,
      { years, startYear, completedTerms },
      { programCode, specialisation, minor },
    );
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
            updateAllWarnings(
              dispatch,
              { years, startYear, completedTerms },
              { programCode, specialisation, minor },
            );
          }}
          onDragStart={(result) => handleOnDragStart(
            result,
            courses,
            setTermsOffered,
            setIsDragging,
          )}
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
                const iYear = parseInt(startYear, 10) + parseInt(index, 10);
                if (hidden[iYear]) return null;
                return (
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
                      if (!isSummerEnabled && term === "T0") return null;
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
              })}
            </div>
            <UnplannedColumn />
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default TermPlanner;
