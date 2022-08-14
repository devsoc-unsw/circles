/* TableView types */
export type TableSubgroupCourse = {
  key: string
  title: string
  UOC: number
  termPlanned: string
  unplanned: boolean
};

export type TableStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: TableSubgroupCourse[]
  }
};

/* GridView types */
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
