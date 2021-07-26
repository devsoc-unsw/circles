import { plannerActions } from "../../actions/plannerActions";
import { useSelector, useDispatch } from "react-redux";

export const handleOnDragEnd = (result, dragEndProps) => {
  const { setIsDragging, dispatch, years, startYear } = dragEndProps;

  setIsDragging(false);

  const { destination, source, draggableId } = result;
  let newYears = [...years];

  if (!destination) return; // drag outside container
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  )
    // drag to same place
    return;

  const destYear = destination.droppableId.match(/[0-9]{4}/)[0];
  const destTerm = destination.droppableId.match(/t[1-3]/)[0];
  const destRow = destYear - startYear;
  const destBox = years[destRow][destTerm];

  // === move unplanned course to term ===
  if (source.droppableId.match(/[0-9]{4}/) === null) {
    //     // updated sortedUnplanned list
    //     const type = source.droppableId;
    //     const code = sortedUnplanned[type][source.index];
    //     const sortedUnplannedCpy = Object.assign({}, sortedUnplanned);
    //     sortedUnplannedCpy[type] = sortedUnplannedCpy[type].filter(
    //       (course) => course !== code
    //     );
    //     console.log(draggableId);

    //     // setSortedUnplanned(sortedUnplannedCpy);
    //     dispatch(plannerActions("SET_SORTED_UNPLANNED", sortedUnplannedCpy));
    dispatch(plannerActions("SET_UNPLANNED", draggableId));

    // update destination term box
    const destCoursesCpy = Array.from(years[destRow][destTerm]);
    destCoursesCpy.splice(destination.index, 0, draggableId);
    newYears[destRow][destTerm] = destCoursesCpy;
    dispatch(plannerActions("SET_YEARS", newYears));
    return;
  }

  const srcYear = source.droppableId.match(/[0-9]{4}/)[0];
  const srcTerm = source.droppableId.match(/t[1-3]/)[0];
  const srcRow = srcYear - startYear;
  const srcBox = years[srcRow][srcTerm];

  // === move within one term ===
  if (srcBox === destBox) {
    const alteredBox = Array.from(srcBox);
    alteredBox.splice(source.index, 1);
    alteredBox.splice(destination.index, 0, draggableId);
    newYears[srcRow][srcTerm] = alteredBox;
    dispatch(plannerActions("SET_YEARS", newYears));
    return;
  }

  // === move from one term to another ===
  const srcCoursesCpy = Array.from(years[srcRow][srcTerm]);
  srcCoursesCpy.splice(source.index, 1);

  const destCoursesCpy = Array.from(years[destRow][destTerm]);
  destCoursesCpy.splice(destination.index, 0, draggableId);

  newYears[srcRow][srcTerm] = srcCoursesCpy;
  newYears[destRow][destTerm] = destCoursesCpy;

  dispatch(plannerActions("SET_YEARS", newYears));
};

export const handleOnDragStart = (
  courseItem,
  courses,
  setTermsOffered,
  setIsDragging
) => {
  const course = courseItem.draggableId;
  const terms = courses.get(course)["termsOffered"];
  setTermsOffered(terms);
  setIsDragging(true);
};
