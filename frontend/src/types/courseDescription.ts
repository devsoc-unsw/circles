import { Course, CoursesUnlockedWhenTaken } from './api';
import { CourseList } from './courses';

type CourseInfo = {
  course?: Course;
  pathFrom?: CourseList;
  unlocked?: CoursesUnlockedWhenTaken;
};

export type CourseDescInfoResCache = Record<string, CourseInfo>;
