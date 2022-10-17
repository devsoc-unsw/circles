export type EnrolmentCapacityData = {
  enrolments: number;
  capacity: number;
};

type CourseClass = {
  activity: 'Lecture' | 'Seminar' | 'Thesis Research' | 'Project';
  courseEnrolment: EnrolmentCapacityData;
};

export type CourseTimetable = {
  classes: CourseClass[];
};
