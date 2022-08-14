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
