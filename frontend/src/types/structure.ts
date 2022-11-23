export type ProgramStructure = {
  [groupKey: string]: {
    content: {
      [subgroupKey: string]: {
        UOC: number;
        type: string;
        courses: {
          [courseKey: string]: string;
        };
        notes: string;
      };
    };
    name: string;
  };
};
