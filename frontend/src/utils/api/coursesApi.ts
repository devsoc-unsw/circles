import axios from 'axios';
import { Course } from 'types/api';

export const handleGetCourseInfo = async (courseId: string) => {
  const res = await axios.get<Course>(`course/getCourses/${courseId}`);
  return res.data;
};

export const getCoursesInfo = async (courseIds: string[]): Promise<Record<string, Course>> => {
  const courses: Record<string, Course> = {};
  courseIds.forEach(async (id) => {
    const res = await axios.get<Course>(`course/getCourse/${id}`);
    courses[id] = res.data;
  });
  return courses;
};
