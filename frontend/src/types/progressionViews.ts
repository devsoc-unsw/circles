export type ViewSubgroupCourse = {
  courseCode: string;
  title: string;
  UOC: number;
  plannedFor: string;
  // isUnplanned used to differentiate course in planner cart but has not been planned
  isUnplanned: boolean;
  isMultiterm: boolean;
  isDoubleCounted: boolean;
  // flag to determine if a subgroup has more than enough courses to meet uoc requirements
  isOverCounted: boolean;
};

export type ViewSubgroup = {
  isCoursesOverflow: boolean;
  courses: ViewSubgroupCourse[];
};

export type ProgressionViewStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: ViewSubgroup;
  };
};

export type ProgressionAdditionalCourses = Record<string, ViewSubgroupCourse>;

/* GridView types */
export enum Views {
  TABLE,
  GRID,
  GRID_CONCISE
}
