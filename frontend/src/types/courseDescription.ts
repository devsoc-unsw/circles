import { Course, CoursesUnlockedWhenTaken } from './api';
import { EnrolmentCapacityData } from './courseCapacity';
import { CourseList } from './courses';

type CourseInfo = {
  course?: Course;
  pathFrom?: CourseList;
  unlocked?: CoursesUnlockedWhenTaken;
  courseCap?: EnrolmentCapacityData;
};

export type CourseDescInfoResCache = Record<string, CourseInfo>;
