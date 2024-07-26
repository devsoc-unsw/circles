import axios from 'axios';
import { CoursesAllUnlocked } from 'types/api';
import { CoursesResponse, DegreeResponse, PlannerResponse } from 'types/userResponse';
import prepareUserPayload from 'utils/prepareUserPayload';

export const getAllUnlockedCourses = async (
  degree: DegreeResponse,
  planner: PlannerResponse,
  courses: CoursesResponse
): Promise<CoursesAllUnlocked> => {
  const res = await axios.post<CoursesAllUnlocked>(
    '/courses/getAllUnlocked/',
    JSON.stringify(prepareUserPayload(degree, planner, courses))
  );

  return res.data;
};
