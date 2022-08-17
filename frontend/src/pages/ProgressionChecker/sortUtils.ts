import { ViewSubgroupCourse } from 'types/progressionViews';

const sortByAlphaNumeric = (courseA: ViewSubgroupCourse, courseB: ViewSubgroupCourse)
: number => (courseA.courseCode
      > courseB.courseCode ? 1 : -1);

const sortByLevel = (courseA: ViewSubgroupCourse, courseB: ViewSubgroupCourse)
: number => {
  const courseALevel = courseA.courseCode.slice(4, 5);
  const courseBLevel = courseB.courseCode.slice(4, 5);
  if (courseALevel !== courseBLevel) return courseALevel > courseBLevel ? 1 : -1;
  return courseA.courseCode > courseB.courseCode ? 1 : -1;
};

export enum SortFn {
  AlphaNumeric,
  Level,
}

export { sortByAlphaNumeric, sortByLevel };
