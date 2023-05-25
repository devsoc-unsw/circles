import React, { Suspense, useEffect, useRef, useState } from 'react';
import type { OnDragEndResponder, OnDragStartResponder } from 'react-beautiful-dnd';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { Badge } from 'antd';
import { Term } from 'types/planner';
import { badPlanner, PlannerResponse } from 'types/userResponse';
import { getCourse } from 'utils/api/courseApi';
import {
  handleSetPlannedCourseToTerm,
  handleSetUnplannedCourseToTerm,
  handleUnscheduleAll,
  handleUnscheduleCourse
} from 'utils/api/plannerApi';
import { getUserPlanner } from 'utils/api/userApi';
import openNotification from 'utils/openNotification';
import PageTemplate from 'components/PageTemplate';
import Spinner from 'components/Spinner';
import { GridItem } from './common/styles';
import HideYearTooltip from './HideYearTooltip';
import OptionsHeader from './OptionsHeader';
import S from './styles';
import TermBox from './TermBox';
import UnplannedColumn from './UnplannedColumn';
import { isPlannerEmpty } from './utils';

const DragDropContext = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.DragDropContext }))
);

const TermPlanner = () => {
  const queryClient = useQueryClient();
  const plannerQuery = useQuery('planner', getUserPlanner);
  // const degreeQuery = useQuery('degree', getUserDegree);
  const queryCourse = getCourse; // This should be changed to useQuery

  const planner: PlannerResponse = plannerQuery.data || badPlanner;
  // const degree: DegreeResponse = degreeQuery.data || badDegree;

  const setUnplannedToTermMutation = useMutation(handleSetUnplannedCourseToTerm, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: () => {
      // eslint-disable-next-line no-console
      console.error('Error adding to unplanned', setUnplannedToTermMutation.error);
    }
  });

  const setPlannedToTermMutation = useMutation(handleSetPlannedCourseToTerm, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: () => {
      // eslint-disable-next-line no-console
      console.error('Error adding to planned', setPlannedToTermMutation.error);
    }
  });

  const unscheduleCourseMutation = useMutation(handleUnscheduleCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: () => {
      // eslint-disable-next-line no-console
      console.error('Error unscheduling course', unscheduleCourseMutation.error);
    }
  });

  const unscheduleAllMutation = useMutation(handleUnscheduleAll, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: () => {
      // eslint-disable-next-line no-console
      console.error('Error unscheduling all courses', unscheduleAllMutation.error);
    }
  });

  const [draggingCourse, setDraggingCourse] = useState('');
  const [checkYearMultiTerm, setCheckYearMultiTerm] = useState('');
  const [multiCourse, setMultiCourse] = useState('');

  const dispatch = useDispatch();

  // I will fix this bit later™
  /*
  // needed for useEffect deps as it does not deep compare arrays well enough :c
  // also only want it to update on new/removed course codes
  const courses = Object.keys(planner.courses).sort().join('');

  useEffect(() => {
    // update the legacy term offered
    const updateOfferingsData = async () => {
      const years: string[] = [];
      for (let i = 0; i < planner.numYears; i++) {
        years.push((planner.startYear + i).toString());
      }

      // get the outdated legacy offerings
      const outdated = Object.entries(planner.courses)
        .filter(([, course]) => {
          const oldOfferings = course.legacyOfferings;
          // no legacy offering data, or doesn't include the wanted years
          return !oldOfferings || years.filter((y) => !(y in oldOfferings)).length > 0;
        })
        .map(([code]) => code);

      // update them
      const data = await getAllCourseOfferings(outdated, years);
      Object.entries(data).forEach(([code, offerings]) => {
        dispatch(updateLegacyOfferings({ code, offerings }));
      });
    };

    updateOfferingsData();

    // disabled planner.courses as part of useEffect dep to avoid api double calling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, dispatch, planner.numYears, planner.startYear]);
  */

  const plannerEmpty = isPlannerEmpty(planner);
  useEffect(() => {
    // Planner validation should be done automaticall on the backend
    // const validateTermPlanner = async () => {
    //   try {
    //     const res = await axios.post<ValidateTermPlanner>('/planner/validateTermPlanner/', payload);
    //     dispatch(toggleWarnings(res.data.courses_state));
    //   } catch (err) {
    //     // eslint-disable-next-line no-console
    //     console.error('Error at validateTermPlanner', err);
    //   }
    // };

    if (plannerEmpty) {
      openNotification({
        type: 'info',
        message: 'Your terms are looking a little empty',
        description:
          'Add courses from the course selector to the term planner and drag courses from the unplanned column'
      });
    }
    // validateTermPlanner();
  }, [plannerEmpty, dispatch]);

  const currYear = new Date().getFullYear();

  /* Ref used for exporting planner to image */
  const plannerPicRef = useRef<HTMLDivElement>(null);

  const handleOnDragStart: OnDragStartResponder = async (result) => {
    const courseCode = result.draggableId.slice(0, 8); // This seems sketchy tbh
    setDraggingCourse(courseCode);
    // I'm not sure why es-lint takes such great offence to this
    // eslint-disable-next-line
    const course = await queryCourse(courseCode);
    // eslint-disable-next-line
    if (course.is_multiterm) {
      setCheckYearMultiTerm(result.source.droppableId);
      setMultiCourse(courseCode);
    }
  };

  const handleOnDragEnd: OnDragEndResponder = async (result) => {
    setDraggingCourse('');
    setCheckYearMultiTerm('');
    setMultiCourse('');
    const { destination, source, draggableId: draggableIdUnique } = result;
    // draggableIdUnique contains course code + term (e.g. COMP151120T1)
    // draggableId only contains the course code (e.g. COMP1511)
    const courseCode = draggableIdUnique.slice(0, 8);

    if (!destination) return; // drag outside container

    // const course = await courseQuery(courseCode);

    if (source.droppableId === 'unplanned' && destination.droppableId === 'unplanned') {
      // Do nothing
      return;
    }

    if (source.droppableId === 'unplanned' && destination.droppableId !== 'unplanned') {
      // TODO: Multiterm check

      setUnplannedToTermMutation.mutate({
        destRow: Number(destination.droppableId.match(/[0-9]{4}/)?.[0]) - planner.startYear,
        destTerm: destination.droppableId.match(/T[0-3]/)?.[0] as Term,
        destIndex: destination.index,
        courseCode
      });

      return;
    }

    if (source.droppableId !== 'unplanned' && destination.droppableId === 'unplanned') {
      unscheduleCourseMutation.mutate(courseCode);
      return;
    }

    if (source.droppableId !== 'unplanned' && destination.droppableId !== 'unplanned') {
      // TODO: Multiterm check

      setPlannedToTermMutation.mutate({
        srcRow: Number(source.droppableId.match(/[0-9]{4}/)?.[0]) - planner.startYear,
        srcTerm: source.droppableId.match(/T[0-3]/)?.[0] as Term,
        destRow: Number(destination.droppableId.match(/[0-9]{4}/)?.[0]) - planner.startYear,
        destTerm: destination.droppableId.match(/T[0-3]/)?.[0] as Term,
        destIndex: destination.index,
        courseCode
      });
    }
  };

  return (
    <PageTemplate>
      <OptionsHeader plannerRef={plannerPicRef} />
      <S.ContainerWrapper>
        <Suspense fallback={<Spinner text="Loading Table..." />}>
          <DragDropContext onDragEnd={handleOnDragEnd} onDragStart={handleOnDragStart}>
            <S.PlannerContainer>
              <S.PlannerGridWrapper summerEnabled={planner.isSummerEnabled} ref={plannerPicRef}>
                <GridItem /> {/* Empty grid item for the year */}
                {planner.isSummerEnabled && <GridItem>Summer</GridItem>}
                <GridItem>Term 1</GridItem>
                <GridItem>Term 2</GridItem>
                <GridItem>Term 3</GridItem>
                {planner.years.map((year, index) => {
                  const iYear = planner.startYear + index;
                  const yearUOC = 0;
                  // Object.keys(year).forEach((termKey) => {
                  //   Object.keys(planner.courses).forEach((courseCode) => {
                  //     if (year[termKey as Term].includes(courseCode)) {
                  //       yearUOC += planner.courses[courseCode].UOC;
                  //     }
                  //   });
                  // });
                  // New backend planner doesn't have 'hidden' years
                  // if (planner.hidden[iYear]) return null;
                  return (
                    <React.Fragment key={iYear}>
                      <S.YearGridBox>
                        <S.YearWrapper>
                          <S.YearText currYear={currYear === iYear}>{iYear}</S.YearText>
                          <HideYearTooltip year={iYear} />
                        </S.YearWrapper>
                        <Badge
                          style={{
                            backgroundColor: '#efdbff',
                            color: '#000000'
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
                            draggingCourse={!draggingCourse ? undefined : draggingCourse}
                            currMultiCourseDrag={checkYearMultiTerm === key ? multiCourse : ''}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                <UnplannedColumn dragging={!!draggingCourse} />
              </S.PlannerGridWrapper>
            </S.PlannerContainer>
          </DragDropContext>
        </Suspense>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};

export default TermPlanner;
