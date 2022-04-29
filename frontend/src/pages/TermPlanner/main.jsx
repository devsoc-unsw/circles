import React, { useState, useEffect, useRef } from "react";
import { notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";
import TermBox from "./TermBox";
import SkeletonPlanner from "./misc/SkeletonPlanner";
import "./main.less";
import updateAllWarnings from "./ValidateTermPlanner";
import UnplannedColumn from "./UnplannedColumn";
import OptionsHeader from "./optionsHeader/main";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import HideYearTooltip from "./HideYearTooltip";
import {
  moveCourse, setPlannedCourseToTerm, setUnplannedCourseToTerm,
} from "../../reducers/plannerSlice";

// checks if no courses have been planned (to display help notification
// & determine if unschedule all button available)
const isAllEmpty = (years) => (
  years.every((year) => Object.keys(year).every((key) => year[key].length === 0))
);

const openNotification = () => {
  const args = {
    message: "Your terms are looking a little empty",
    description: "Add courses from the course selector to the term planner by dragging from the unplanned column",
    duration: 3,
    className: "text helpNotif",
    placement: "topRight",
  };
  notification.info(args);
};

const TermPlanner = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [suppress, setSuppress] = useState(false);
  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const {
    years,
    startYear,
    courses,
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
      suppress,
    );
  }, [years, dispatch, startYear, completedTerms, programCode, specialisation, minor]);
  const currYear = new Date().getFullYear();

  const plannerPic = useRef();

  const handleOnDragStart = (courseItem) => {
    const course = courseItem.draggableId;
    const terms = courses[course].termsOffered;
    setTermsOffered(terms);
    setIsDragging(true);
  };

  const handleOnDragEnd = (result) => {
    setIsDragging(false);

    const { destination, source, draggableId } = result;

    if (!destination) return; // drag outside container

    dispatch(
      moveCourse({
        course: draggableId,
        term: destination.droppableId,
      }),
    );

    if (
      destination.droppableId === source.droppableId
      && destination.index === source.index
    ) {
      // drag to same place
      return;
    }

    const destYear = destination.droppableId.match(/[0-9]{4}/)[0];
    const destTerm = destination.droppableId.match(/T[0-3]/)[0];
    const destRow = destYear - startYear;
    const destIndex = destination.index;

    if (source.droppableId.match(/T[0-3]/) === null) {
      // === move unplanned course to term ===
      dispatch(setUnplannedCourseToTerm({
        destRow, destTerm, destIndex, course: draggableId,
      }));
    } else {
      // === move between terms ===
      const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
      const srcTerm = source.droppableId.match(/T[0-3]/)[0];
      const srcRow = srcYear - startYear;
      const srcIndex = source.index;

      dispatch(setPlannedCourseToTerm({
        srcRow,
        srcTerm,
        srcIndex,
        destRow,
        destTerm,
        destIndex: destination.index,
        course: draggableId,
      }));
    }
  };

  return (
    <div className="mainContainer">
      <OptionsHeader
        areYearsHidden={areYearsHidden}
        plannerRef={plannerPic}
        isAllEmpty={isAllEmpty}
        setSuppress={setSuppress}
        suppress={suppress}
      />
      {isLoading ? (
        <SkeletonPlanner />
      ) : (
        <DragDropContext
          onDragEnd={(result) => {
            handleOnDragEnd(result);
            updateAllWarnings(
              dispatch,
              { years, startYear, completedTerms },
              { programCode, specialisation, minor },
              suppress,
            );
          }}
          onDragStart={handleOnDragStart}
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
