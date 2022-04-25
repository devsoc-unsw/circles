import { moveCourse, setUnplanned, setYears } from "../../reducers/plannerSlice";

export const handleOnDragEnd = (result, dragEndProps) => {
  const {
    setIsDragging, dispatch, years, startYear,
  } = dragEndProps;

  setIsDragging(false);

  const { destination, source, draggableId } = result;
  const newYears = [...years];

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
  const destBox = years[destRow][destTerm];

  // === move unplanned course to term ===
  if (source.droppableId.match(/T[0-3]/) === null) {
    dispatch(setUnplanned(draggableId));

    // update destination term box
    const destCoursesCpy = Array.from(years[destRow][destTerm]);
    destCoursesCpy.splice(destination.index, 0, draggableId);
    newYears[destRow][destTerm] = destCoursesCpy;
    dispatch(setYears(newYears));

    return;
  }

  const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
  const srcTerm = source.droppableId.match(/T[0-3]/)[0];
  const srcRow = srcYear - startYear;
  const srcBox = years[srcRow][srcTerm];

  // === move within one term ===
  if (srcBox === destBox) {
    const alteredBox = Array.from(srcBox);
    alteredBox.splice(source.index, 1);
    alteredBox.splice(destination.index, 0, draggableId);
    newYears[srcRow][srcTerm] = alteredBox;
    dispatch(setYears(newYears));
    return;
  }

  // === move from one term to another ===
  const srcCoursesCpy = Array.from(years[srcRow][srcTerm]);
  srcCoursesCpy.splice(source.index, 1);

  const destCoursesCpy = Array.from(years[destRow][destTerm]);
  destCoursesCpy.splice(destination.index, 0, draggableId);

  newYears[srcRow][srcTerm] = srcCoursesCpy;
  newYears[destRow][destTerm] = destCoursesCpy;
  dispatch(setYears(newYears));
};

export const handleOnDragStart = (
  courseItem,
  courses,
  setTermsOffered,
  setIsDragging,
) => {
  const course = courseItem.draggableId;
  const terms = courses.get(course).termsOffered;
  setTermsOffered(terms);
  setIsDragging(true);
};
