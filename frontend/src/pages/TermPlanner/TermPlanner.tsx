import React, { Suspense, useEffect, useRef, useState } from 'react';
import type { OnDragEndResponder, OnDragStartResponder } from 'react-beautiful-dnd';
import { useMutation, useQueries, useQuery, useQueryClient } from 'react-query';
import { Badge } from 'antd';
import { Course } from 'types/api';
import { PlannedToTerm, Term, UnPlannedToTerm } from 'types/planner';
import {
  badCourseInfo,
  badCourses,
  badPlanner,
  CoursesResponse,
  PlannerResponse
} from 'types/userResponse';
import { getCourseInfo } from 'utils/api/courseApi';
import {
  setPlannedCourseToTerm,
  setUnplannedCourseToTerm,
  unscheduleCourse
} from 'utils/api/plannerApi';
import { getUserCourses, getUserPlanner } from 'utils/api/userApi';
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
  const planner: PlannerResponse = plannerQuery.data ?? badPlanner;

  const coursesQuery = useQuery('courses', getUserCourses);
  const courses: CoursesResponse = coursesQuery.data ?? badCourses;

  const courseQueries = useQueries(
    Object.keys(courses).map((code: string) => ({
      queryKey: ['course', code],
      queryFn: () => getCourseInfo(code)
    }))
  );

  const courseInfos: Record<string, Course> = Object.fromEntries(
    Object.keys(courses).map((code: string, index: number) => [
      code,
      courseQueries[index].data ?? badCourseInfo
    ])
  );

  const [draggingCourse, setDraggingCourse] = useState('');

  // Mutations
  const setPlannedCourseToTermMutation = useMutation(setPlannedCourseToTerm, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at setPlannedCourseToTermMutation: ', err);
    }
  });

  const handleSetPlannedCourseToTerm = async (data: PlannedToTerm) => {
    setPlannedCourseToTermMutation.mutate(data);
  };

  const setUnplannedCourseToTermMutation = useMutation(setUnplannedCourseToTerm, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at setUnplannedCourseToTermMutation: ', err);
    }
  });

  const handleSetUnplannedCourseToTerm = async (data: UnPlannedToTerm) => {
    setUnplannedCourseToTermMutation.mutate(data);
  };

  const unscheduleCourseMutation = useMutation(unscheduleCourse, {
    onSuccess: () => {
      queryClient.invalidateQueries('planner');
    },
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error at unscheduleCourseMutation: ', err);
    }
  });

  const handleUnscheduleCourse = async (courseid: string) => {
    unscheduleCourseMutation.mutate(courseid);
  };

  // const dispatch = useDispatch();

  // needed for useEffect deps as it does not deep compare arrays well enough :c
  // also only want it to update on new/removed course codes
  // const courses = Object.keys(planner.courses).sort().join('');

  /// TODO: GET LEGACY OFFERINGS (doesn't seem to be stored in backend?!?)
  // useEffect(() => {
  //   // update the legacy term offered
  //   const updateOfferingsData = async () => {
  //     const years: string[] = [];
  //     for (let i = 0; i < planner.years.length; i++) {
  //       years.push((planner.startYear + i).toString());
  //     }

  //     // get the outdated legacy offerings
  //     const outdated = Object.entries(planner.courses)
  //       .filter(([, course]) => {
  //         const oldOfferings = course.legacyOfferings;
  //         // no legacy offering data, or doesn't include the wanted years
  //         return !oldOfferings || years.filter((y) => !(y in oldOfferings)).length > 0;
  //       })
  //       .map(([code]) => code);

  //     // update them
  //     const data = await getAllCourseOfferings(outdated, years);
  //     Object.entries(data).forEach(([code, offerings]) => {
  //       dispatch(updateLegacyOfferings({ code, offerings }));
  //     });
  //   };

  //   updateOfferingsData();

  //   // disabled planner.courses as part of useEffect dep to avoid api double calling
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [courses, dispatch, planner.years.length, planner.startYear]);

  // don't need to validate cos it should be done already
  // const payload = JSON.stringify(prepareCoursesForValidationPayload(planner, degree, showWarnings));
  const plannerEmpty = isPlannerEmpty(planner);
  useEffect(() => {
    if (plannerEmpty) {
      openNotification({
        type: 'info',
        message: 'Your terms are looking a little empty',
        description:
          'Add courses from the course selector to the term planner and drag courses from the unplanned column'
      });
    }
  }, [plannerEmpty]);

  const currYear = new Date().getFullYear();

  /* Ref used for exporting planner to image */
  const plannerPicRef = useRef<HTMLDivElement>(null);

  const handleOnDragStart: OnDragStartResponder = async (result) => {
    const courseCode = result.draggableId.slice(0, 8);
    setDraggingCourse(courseCode);
  };

  const handleOnDragEnd: OnDragEndResponder = async (result) => {
    setDraggingCourse('');
    const { destination, source, draggableId: draggableIdUnique } = result;
    // draggableIdUnique contains course code + term (e.g. COMP151120T1)
    // draggableId only contains the course code (e.g. COMP1511)
    const draggableId = draggableIdUnique.slice(0, 8);

    if (!destination) return; // drag outside container

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      // drag to same place
      return;
    }

    const destIndex = destination.index;

    if (destination.droppableId === 'unplanned') {
      handleUnscheduleCourse(draggableId);
      return;
    }

    const destYear = Number(destination.droppableId.match(/[0-9]{4}/)?.[0]);
    const destTerm = destination.droppableId.match(/T[0-3]/)?.[0] as Term;
    const destRow = destYear - planner.startYear;

    if (source.droppableId === 'unplanned') {
      // === move unplanned course to term ===
      const data = {
        destRow,
        destTerm,
        destIndex,
        courseCode: draggableId
      };
      handleSetUnplannedCourseToTerm(data);
    } else {
      // === move between terms ===
      const srcYear = parseInt(source.droppableId.match(/[0-9]{4}/)?.[0] as string, 10);
      const srcTerm = source.droppableId.match(/T[0-3]/)?.[0] as Term;
      const srcRow = srcYear - planner.startYear;
      const data = {
        srcRow,
        srcTerm,
        destRow,
        destTerm,
        destIndex,
        courseCode: draggableId
      };
      handleSetPlannedCourseToTerm(data);
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
                  let yearUOC = 0;
                  Object.keys(year).forEach((termKey) => {
                    Object.entries(courseInfos).forEach(([courseCode, courseInfo]) => {
                      if (year[termKey as Term].includes(courseCode)) {
                        yearUOC += courseInfo.UOC;
                      }
                    });
                  });

                  // TODO: Mov hidden years to frontend
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
                            courseInfos={courseInfos}
                            termCourseCodes={year[term as Term]}
                            draggingCourseCode={!draggingCourse ? undefined : draggingCourse}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                <UnplannedColumn dragging={!!draggingCourse} courseInfos={courseInfos} />
              </S.PlannerGridWrapper>
            </S.PlannerContainer>
          </DragDropContext>
        </Suspense>
      </S.ContainerWrapper>
    </PageTemplate>
  );
};

export default TermPlanner;
