export type TableSubgroup = {
  key: string
  title: string
  UOC: number
  termPlanned: string
};

export type TableStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: TableSubgroup[]
  }
};
