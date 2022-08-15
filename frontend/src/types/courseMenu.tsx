export type MenuDataSubgroup = {
  courseCode: string
  title: string
  unlocked: boolean
  accuracy: boolean
};

export type MenuDataStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: MenuDataSubgroup[]
  }
};

export type CourseUnitsStructure = {
  [groupKey: string]: {
    [subgroupKey: string]: {
      total: number
      curr: number
    }
  }
};
