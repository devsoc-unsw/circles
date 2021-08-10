import { plannerActions } from "../../actions/plannerActions";
import { useSelector, useDispatch } from "react-redux";

export const handleOnDragEnd = (result, dragEndProps) => {
  const { setIsDragging, dispatch, years, startYear, plannedCourses, courses } =
    dragEndProps;

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

  checkPrereq(
    draggableId,
    destination,
    plannedCourses,
    courses,
    dispatch,
    draggableId
  );

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

const checkPrereq = (
  course,
  destination,
  plannedCourses,
  courses,
  dispatch,
  draggableId
) => {
  const prereqs = courses.get(course).prereqs;

//   prereqs.every((prereq) => {
//     // prereq not present in planned terms
//     if (plannedCourses.get(prereq) == null) {
//       warning = true;
//       return false;
//     }
//     // course placed before (or during) prereq is complete
//     if (destination.droppableId <= plannedCourses.get(prereq)["term"]) {
//       warning = true;
//       return false;
//     }
//   });
//   console.log(prereqs)


//   const expr = "isComplete.get(COMP1511 || COMP1521 && (COMP1531 || COMP1541)";
  const expr = prereqs;
  let warning = true;
  if (expr === "") {
//   console.log(expr);
	warning = false;
} else {
	const exprArray = expr.replace(/ \|\|| \&\&|\(|\)/g,'').split(" ");
	const isComplete = new Map();
	exprArray.forEach(elem => {
		 if (plannedCourses.get(elem) == null) {
		  // prereq not present in planned terms
		  isComplete.set(elem, false);
		} else if	  (destination.droppableId <= plannedCourses.get(elem)["term"]) {
			// course placed before (or during) prereq is complete
		  isComplete.set(elem, false);
		} else {
		  isComplete.set(elem, true);
		}
	});
	const exprWithMap = expr.replace(/([A-Z]+[0-9]+)/g, 'isComplete.get("$1")');
	 warning = !eval(exprWithMap)
}
//   console.log(exprWithMap);
//   console.log(eval(exprWithMap))


  dispatch(
    plannerActions("UPDATE_PLANNED_COURSES", {
      course: draggableId,
      term: destination.droppableId,
      warning: warning,
    })
  );
};
