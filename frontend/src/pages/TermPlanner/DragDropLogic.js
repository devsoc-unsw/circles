import { plannerActions } from "../../actions/plannerActions";
import { useSelector, useDispatch } from "react-redux";

export const handleOnDragEnd = (result, dragEndProps) => {
  const { setIsDragging, dispatch, years, startYear, plannedCourses, courses } =
    dragEndProps;

  setIsDragging(false);

  const { destination, source, draggableId } = result;
  let newYears = [...years];

  if (!destination) return; // drag outside container

  // check if prereqs are complete, and trigger warning if not
  let arePrereqsCompleted = checkPrereq(
    draggableId,
    destination.droppableId,
    courses
  );
  // courses.get(draggableId)["plannedFor"] = destination.droppableId;
  // courses.get(draggableId)["warning"] = checkPrereq(
  //   draggableId,
  //   destination.droppableId,
  //   courses
  // );
  dispatch(
    // might need to change name
    plannerActions("MOVE_COURSE", {
      course: draggableId,
      term: destination.droppableId,
      warning: !arePrereqsCompleted,
    })
  );

  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  )
    // drag to same place
    return;

  const destYear = destination.droppableId.match(/[0-9]{4}/)[0];
  const destTerm = destination.droppableId.match(/t[0-3]/)[0];
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
  const srcTerm = source.droppableId.match(/t[0-3]/)[0];
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
  // updateWarnings(newYears, startYear, courses, dispatch);
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

const checkPrereq = (course, term, courses) => {
  const prereqs = courses.get(course).prereqs;
  let arePrereqsCompleted = false;
  // for example, expr can be: (COMP1511 || COMP1521 && (COMP1531 || COMP1541);
  const expr = prereqs;
  if (expr == null) return true;
  if (expr === "") {
    return true;
  } else {
    const exprArray = expr.replace(/ \|\|| \&\&|\(|\)/g, "").split(" ");
    // from above example, exprArray is: [COMP1511, COMP1521, COMP1531, COMP1541]
    const isComplete = new Map();
    exprArray.forEach((elem) => {
      if (courses.get(elem) == null) {
        // prereq not in term planner
        isComplete.set(elem, false);
      } else if (courses.get(elem)["plannedFor"] == null) {
        // prereq in unplanned
        isComplete.set(elem, false);
      } else if (term <= courses.get(elem)["plannedFor"]) {
        // course placed before (or during) prereq is complete
        isComplete.set(elem, false);
      } else {
        // if it gets to this point, that means prereq has been complete
        isComplete.set(elem, true);
      }
    });
    const exprWithMap = expr.replace(/([A-Z]+[0-9]+)/g, 'isComplete.get("$1")');

    // from above example, exprWithMap is: (isComplete.get(COMP1511) || ...)
    arePrereqsCompleted = eval(exprWithMap);
    return arePrereqsCompleted;
  }
};

export const updateWarnings = (years, startYear, courses, dispatch) => {
  let i = startYear;
  years.forEach((year) => {
    for (const term in year) {
      year[term].forEach((course) => {
        let termTag = i + term;
        let arePrereqsCompleted = checkPrereq(course, termTag, courses);
        // console.log(`${course}: ${!arePrereqsCompleted}`);
        dispatch(
          plannerActions("MOVE_COURSE", {
            course: course,
            term: termTag,
            warning: !arePrereqsCompleted,
          })
        );
      });
    }
    i += 1;
  });
};
