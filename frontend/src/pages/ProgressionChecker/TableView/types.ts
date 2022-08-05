export type TableSubgroup = {
  key: string
  title: string
  UOC: number
  termPlanned: number
};

export type TableStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: TableSubgroup[]
  }
};
