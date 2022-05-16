import React, { useState, useEffect, useRef } from "react";
import { notification } from "antd";
import { DragDropContext } from "react-beautiful-dnd";
import { useSelector, useDispatch } from "react-redux";
import "./index.less";
import validateTermPlanner from "./validateTermPlanner";
import OptionsHeader from "./OptionsHeader";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import HideYearTooltip from "./HideYearTooltip";
import {
  moveCourse, setPlannedCourseToTerm, setUnplannedCourseToTerm, unschedule,
} from "../../reducers/plannerSlice";
import PageTemplate from "../../components/PageTemplate";
import UnplannedColumn from "./UnplannedColumn";
import TermBox from "./TermBox";

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
  const [suppress, setSuppress] = useState(true);
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
    if (isAllEmpty(years)) openNotification();
    validateTermPlanner(
      dispatch,
      { years, startYear, completedTerms },
      { programCode, specialisation, minor },
      suppress,
    );
  }, [years, suppress, dispatch, startYear, completedTerms, programCode, specialisation, minor]);
  const currYear = new Date().getFullYear();

  const plannerPic = useRef();
  const unplannedRef = useRef();

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

    if (destination.droppableId !== "unplanned") {
      // === moving course to unplanned doesn't require term logic ===
      dispatch(
        moveCourse({
          course: draggableId,
          term: destination.droppableId,
        }),
      );
    }

    if (
      destination.droppableId === source.droppableId
      && destination.index === source.index
    ) {
      // drag to same place
      return;
    }

    const destIndex = destination.index;

    if (destination.droppableId === "unplanned") {
      // === move course to unplanned ===
      dispatch(unschedule({
        destIndex,
        code: draggableId,
      }));
      return;
    }

    const destYear = destination.droppableId.match(/[0-9]{4}/)[0];
    const destTerm = destination.droppableId.match(/T[0-3]/)[0];
    const destRow = destYear - startYear;

    if (source.droppableId === "unplanned") {
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
    <PageTemplate>
      <OptionsHeader
        areYearsHidden={areYearsHidden}
        plannerRef={plannerPic}
        isAllEmpty={isAllEmpty}
        setSuppress={setSuppress}
        suppress={suppress}
      />
      <div className="mainContainer">
        <DragDropContext
          onDragEnd={(result) => {
            handleOnDragEnd(result);
            if (result.destination && result.destination.droppableId !== "unplanned") {
              validateTermPlanner(
                dispatch,
                { years, startYear, completedTerms },
                { programCode, specialisation, minor },
                suppress,
              );
            }
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
              {/* Empty div to add space for fixed unplanned column */}
              <div className="gridItem" ref={unplannedRef} />

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
                    {/* Empty div to add space for fixed unplanned column */}
                    <div />
                  </React.Fragment>
                );
              })}
              <UnplannedColumn
                isDragging={isDragging}
                unplannedRef={unplannedRef}
              />
            </div>
          </div>
        </DragDropContext>
      </div>
    </PageTemplate>
  );
};

export default TermPlanner;
