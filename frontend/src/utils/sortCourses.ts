const sortByAlphaNumeric = (
  { courseCode: courseCodeA }: { courseCode: string },
  { courseCode: courseCodeB }: { courseCode: string },
)
: number => (courseCodeA
      > courseCodeB ? 1 : -1);

const sortByLevel = (
  { courseCode: courseCodeA }: { courseCode: string },
  { courseCode: courseCodeB }: { courseCode: string },
) : number => {
  const courseALevel = courseCodeA.slice(4, 5);
  const courseBLevel = courseCodeB.slice(4, 5);
  if (courseALevel !== courseBLevel) return courseALevel > courseBLevel ? 1 : -1;
  return courseCodeA > courseCodeB ? 1 : -1;
};

export enum SortFn {
  AlphaNumeric,
  Level,
}

export { sortByAlphaNumeric, sortByLevel };
