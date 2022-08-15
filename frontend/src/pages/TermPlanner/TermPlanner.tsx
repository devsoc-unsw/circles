import React, { useEffect, useRef, useState } from 'react';
import type { OnDragEndResponder, OnDragStartResponder } from 'react-beautiful-dnd';
import { DragDropContext } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Badge } from 'antd';
import axios from 'axios';
import { ValidateTermPlanner } from 'types/api';
import { Term } from 'types/planner';
import openNotification from 'utils/openNotification';
import prepareCoursesForValidationPayload from 'utils/prepareCoursesForValidationPayload';
import PageTemplate from 'components/PageTemplate';
import type { RootState } from 'config/store';
import {
  moveCourse, setPlannedCourseToTerm, setUnplannedCourseToTerm, toggleWarnings, unschedule,
} from 'reducers/plannerSlice';
import { GridItem } from './common/styles';
import HideYearTooltip from './HideYearTooltip';
import OptionsHeader from './OptionsHeader';
import S from './styles';
import TermBox from './TermBox';
import UnplannedColumn from './UnplannedColumn';
import {
  checkMultitermInBounds,
  isPlannerEmpty,
} from './utils';

const TermPlanner = () => {
  const { showWarnings } = useSelector((state: RootState) => state.settings);
  const planner = useSelector((state: RootState) => state.planner);
  const degree = useSelector((state: RootState) => state.degree);

  const [termsOffered, setTermsOffered] = useState<Term[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const dispatch = useDispatch();
  const getMarkList = () => Object.values(planner.courses).map(((object) => object.mark));

  // a memoised way to check if marks have changed
  const marksRef = useRef(getMarkList());
  if (JSON.stringify(marksRef.current) !== JSON.stringify(getMarkList())) {
    marksRef.current = getMarkList();
  }

  useEffect(() => {
    const validateTermPlanner = async () => {
      try {
        const res = await axios.post<ValidateTermPlanner>(
          '/planner/validateTermPlanner/',
          JSON.stringify(prepareCoursesForValidationPayload(planner, degree, showWarnings)),
        );
        dispatch(toggleWarnings(res.data.courses_state));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error at validateTermPlanner', err);
      }
    };

    if (isPlannerEmpty(planner.years)) {
      openNotification({
        type: 'info',
        message: 'Your terms are looking a little empty',
        description: 'Add courses from the course selector to the term planner and drag courses from the unplanned column',
      });
    }
    validateTermPlanner();
  }, [degree, planner.years, planner.startYear, marksRef.current, showWarnings]);

  const currYear = new Date().getFullYear();

  /* Ref used for exporting planner to image */
  const plannerPicRef = useRef<HTMLDivElement>(null);

  const handleOnDragStart: OnDragStartResponder = (result) => {
    const course = result.draggableId.slice(0, 8);
    const terms = planner.courses[course].termsOffered;
    setTermsOffered(terms);
    setIsDragging(true);
  };

  const handleOnDragEnd: OnDragEndResponder = (result) => {
    setIsDragging(false);
    const { destination, source, draggableId: draggableIdUnique } = result;
    // draggableIdUnique contains course code + term (e.g. COMP151120T1)
    // draggableId only contains the course code (e.g. COMP1511)
    const draggableId = draggableIdUnique.slice(0, 8);

    if (!destination) return; // drag outside container

    if (destination.droppableId !== 'unplanned') {
      // Check if multiterm course extends below bottom row of term planner
      if (planner.courses[draggableId].isMultiterm && !checkMultitermInBounds({
        destRow: Number(destination.droppableId.match(/[0-9]{4}/)?.[0]) - planner.startYear,
        destTerm: destination.droppableId.match(/T[0-3]/)?.[0] as Term,
        srcTerm: source.droppableId as Term,
        course: planner.courses[draggableId],
        isSummerTerm: planner.isSummerEnabled,
        numYears: planner.numYears,
      })) {
        openNotification({
          type: 'warning',
          message: 'Course would extend outside of the term planner',
          description: `Keep ${draggableId} inside the calendar by moving it to a different term instead`,
        });
        return;
      }

      // === moving course to unplanned doesn't require term logic ===
      if (destination.droppableId !== source.droppableId) {
        dispatch(
          moveCourse({
            course: draggableId,
            destTerm: destination.droppableId,
            srcTerm: source.droppableId,
          }),
        );
      }
    }

    if (
      destination.droppableId === source.droppableId
      && destination.index === source.index
    ) {
      // drag to same place
      return;
    }

    const destIndex = destination.index;

    if (destination.droppableId === 'unplanned') {
      // === move course to unplanned ===
      dispatch(unschedule({
        destIndex,
        code: draggableId,
      }));
      return;
    }

    const destYear = Number(destination.droppableId.match(/[0-9]{4}/)?.[0]);
    const destTerm = destination.droppableId.match(/T[0-3]/)?.[0] as Term;
    const destRow = destYear - planner.startYear;

    if (source.droppableId === 'unplanned') {
      // === move unplanned course to term ===
      dispatch(setUnplannedCourseToTerm({
        destRow, destTerm, destIndex, course: draggableId,
      }));
    } else {
      // === move between terms ===
      const srcYear = parseInt(source.droppableId.match(/[0-9]{4}/)?.[0] as string, 10);
      const srcTerm = source.droppableId.match(/T[0-3]/)?.[0] as Term;
      const srcRow = srcYear - planner.startYear;
      const srcIndex = source.index;
      dispatch(setPlannedCourseToTerm({
        srcRow,
        srcTerm,
        srcIndex,
        destRow,
        destTerm,
        destIndex,
        course: draggableId,
      }));
    }
  };

  return (
    <PageTemplate>
      <OptionsHeader
        plannerRef={plannerPicRef}
      />
      <S.ContainerWrapper>
        <DragDropContext
          onDragEnd={handleOnDragEnd}
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
                const iYear = planner.startYear + index;
                let yearUOC = 0;
                Object.keys(year).forEach((termKey) => {
                  Object.keys(planner.courses).forEach((courseCode) => {
                    if (year[termKey as Term].includes(courseCode)) {
                      yearUOC += planner.courses[courseCode].UOC;
                    }
                  });
                });
                if (planner.hidden[iYear]) return null;
                return (
                  <React.Fragment key={iYear}>
                    <S.YearGridBox>
                      <S.YearWrapper>
                        <S.YearText currYear={currYear === iYear}>
                          {iYear}
                        </S.YearText>
                        <HideYearTooltip year={iYear} />
                      </S.YearWrapper>
                      <Badge
                        style={{
                          backgroundColor: '#efdbff',
                          color: '#000000',
                        }}
                        size="small"
                        count={`${yearUOC} UOC`}
                      />
                    </S.YearGridBox>
                    {Object.keys(year).map((term) => {
                      const key = `${iYear}${term}`;
                      if (!planner.isSummerEnabled && term === 'T0') return null;
                      return (
                        <TermBox
                          key={key}
                          name={key}
                          coursesList={year[term as Term]}
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
