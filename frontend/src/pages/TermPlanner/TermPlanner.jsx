import React, { useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Badge, notification } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import {
  moveCourse, setPlannedCourseToTerm, setUnplannedCourseToTerm, toggleWarnings, unschedule,
} from "reducers/plannerSlice";
import HideYearTooltip from "./HideYearTooltip";
import OptionsHeader from "./OptionsHeader";
import TermBox from "./TermBox";
import UnplannedColumn from "./UnplannedColumn";
import { prepareCoursesForValidation } from "./utils";
import "./index.less";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";

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
  const [showMarks, setShowMarks] = useState(false);

  const planner = useSelector((state) => state.planner);

  const degree = useSelector((state) => state.degree);
  const dispatch = useDispatch();
  const getMarkList = () => Object.values(planner.courses).map(((object) => object.mark));
  // a memoised way to check if marks have changed
  const marksRef = useRef(getMarkList());
  if (JSON.stringify(marksRef.current) !== JSON.stringify(getMarkList())) {
    marksRef.current = getMarkList();
  }
  const validateTermPlanner = async () => {
    try {
      const { data } = await axios.post(
        "/planner/validateTermPlanner/",
        JSON.stringify(prepareCoursesForValidation(planner, degree, suppress)),
      );
      dispatch(toggleWarnings(data.courses_state));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  useEffect(() => {
    if (isAllEmpty(planner.years)) openNotification();
    validateTermPlanner();
  }, [
    degree, planner.years, suppress, planner.startYear, marksRef.current,
  ]);

  const currYear = new Date().getFullYear();

  const plannerPic = useRef();

  const handleOnDragStart = (courseItem) => {
    const course = courseItem.draggableId;
    const terms = planner.courses[course].termsOffered;
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
    const destRow = destYear - planner.startYear;

    if (source.droppableId === "unplanned") {
      // === move unplanned course to term ===
      dispatch(setUnplannedCourseToTerm({
        destRow, destTerm, destIndex, course: draggableId,
      }));
    } else {
      // === move between terms ===
      const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
      const srcTerm = source.droppableId.match(/T[0-3]/)[0];
      const srcRow = srcYear - planner.startYear;
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
        areYearsHidden={planner.areYearsHidden}
        plannerRef={plannerPic}
        isAllEmpty={isAllEmpty}
        setSuppress={setSuppress}
        suppress={suppress}
        showMarks={showMarks}
        setShowMarks={setShowMarks}
      />
      <div className="mainContainer">
        <DragDropContext
          onDragEnd={(result) => handleOnDragEnd(result)}
          onDragStart={handleOnDragStart}
        >
          <div className="plannerContainer">
            <div
              className={`gridContainer ${planner.isSummerEnabled && "summerGrid"}`}
              ref={plannerPic}
            >
              <div className="gridItem" />
              {planner.isSummerEnabled && <div className="gridItem">Summer</div>}
              <div className="gridItem">Term 1</div>
              <div className="gridItem">Term 2</div>
              <div className="gridItem">Term 3</div>
              <div className="gridItem">Unplanned</div>
              {planner.years.map((year, index) => {
                const iYear = parseInt(planner.startYear, 10) + parseInt(index, 10);
                let yearUOC = 0;
                Object.keys(year).forEach((i) => {
                  Object.keys(planner.courses).forEach((j) => {
                    if (year[i].includes(j)) {
                      yearUOC += planner.courses[j].UOC;
                    }
                  });
                });
                if (planner.hidden[iYear]) return null;
                return (
                  <React.Fragment key={index}>
                    <Badge style={{ backgroundColor: "#efdbff", color: "#000000" }} size="small" count={`${yearUOC} UOC`} offset={[-26, 42]}>
                      <div className="yearContainer gridItem">
                        <div
                          className={`year ${currYear === iYear && "currYear"}`}
                        >
                          {iYear}
                        </div>
                        <HideYearTooltip year={iYear} />
                      </div>
                    </Badge>
                    {Object.keys(year).map((term) => {
                      const key = iYear + term;
                      if (!planner.isSummerEnabled && term === "T0") return null;
                      return (
                        <TermBox
                          key={key}
                          name={key}
                          coursesList={year[term]}
                          termsOffered={termsOffered}
                          isDragging={isDragging}
                          showMarks={showMarks}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
              <UnplannedColumn
                isDragging={isDragging}
              />
            </div>
          </div>
        </DragDropContext>
      </div>
    </PageTemplate>
  );
};

export default TermPlanner;
