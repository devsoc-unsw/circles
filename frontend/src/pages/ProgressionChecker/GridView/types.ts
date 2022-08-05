export type GridSubgroupCourse = {
  key: string
  title: string
  past: boolean
  termPlanned: number
  uoc: number
  unplanned: boolean
};

export type GridSubgroup = {
  hasLotsOfCourses: boolean
  courses: GridSubgroupCourse[]
};

export type GridStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: GridSubgroup
  }
};
