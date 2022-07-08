import React, { useEffect, useRef, useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import { Badge, notification } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import {
  moveCourse, setPlannedCourseToTerm, setUnplannedCourseToTerm, toggleWarnings, unschedule,
} from "reducers/plannerSlice";
import { GridItem } from "./common/styles";
import HideYearTooltip from "./HideYearTooltip";
import OptionsHeader from "./OptionsHeader";
import S from "./styles";
import TermBox from "./TermBox";
import UnplannedColumn from "./UnplannedColumn";
import { isPlannerEmpty, prepareCoursesForValidation } from "./utils";
// // Used for tippy stylings
// import "tippy.js/dist/tippy.css";
// import "tippy.js/themes/light.css";

const openNotification = () => {
  const args = {
    message: "Your terms are looking a little empty",
    description: "Add courses from the course selector to the term planner by dragging from the unplanned column",
    duration: 3,
    className: "text helpNotif",
    placement: "bottomRight",
  };
  notification.info(args);
};

const TermPlanner = () => {
  const { showWarnings } = useSelector((state) => state.settings);
  const [termsOffered, setTermsOffered] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

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
        JSON.stringify(prepareCoursesForValidation(planner, degree, showWarnings)),
      );
      dispatch(toggleWarnings(data.courses_state));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
  };

  useEffect(() => {
    if (isPlannerEmpty(planner.years)) openNotification();
    validateTermPlanner();
  }, [
    degree, planner.years, planner.startYear, marksRef.current, showWarnings,
  ]);

  const currYear = new Date().getFullYear();

  /* Ref used for exporting planner to image */
  const plannerPicRef = useRef();

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
        plannerRef={plannerPicRef}
      />
      <S.ContainerWrapper>
        <DragDropContext
          onDragEnd={(result) => handleOnDragEnd(result)}
          onDragStart={handleOnDragStart}
        >
          <S.PlannerContainer>
            <S.PlannerGridWrapper
              summerEnabled={planner.isSummerEnabled}
              ref={plannerPicRef}
            >
              <GridItem /> {/* Empty grid item for the year */}
              {planner.isSummerEnabled && <GridItem>Summer</GridItem>}
              <GridItem>Term 1</GridItem>
              <GridItem>Term 2</GridItem>
              <GridItem>Term 3</GridItem>
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
                    <S.YearGridBox>
                      <S.YearWrapper>
                        <S.YearText currYear={currYear === iYear}>
                          {iYear}
                        </S.YearText>
                        <HideYearTooltip year={iYear} />
                      </S.YearWrapper>
                      <Badge
                        style={{
                          backgroundColor: "#efdbff",
                          color: "#000000",
                        }}
                        size="small"
                        count={`${yearUOC} UOC`}
                      />
                    </S.YearGridBox>
                    {Object.keys(year).map((term) => {
                      const key = iYear + term;
                      if (!planner.isSummerEnabled && term === "T0") return null;
                      return (
                        <TermBox
                          key={key}
                          name={key}
                          coursesList={year[term]}
                          termsOffered={termsOffered}
                          dragging={isDragging}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
              <UnplannedColumn dragging={isDragging} />
            </S.PlannerGridWrapper>
          </S.PlannerContainer>
        </DragDropContext>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};

export default TermPlanner;
