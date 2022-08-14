export type GridSubgroupCourse = {
  key: string
  title: string
  past: boolean
  termPlanned: string
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

export enum PlannedState {
  PLANNED,
  UNPLANNED,
}
