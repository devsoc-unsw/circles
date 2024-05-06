import axios from 'axios';
import { CoursesResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';

export const userLogin = async (): Promise<void> => {
  // Login to redirect link
  await axios.get<string>('/auth/authorization_url', { withCredentials: true }).then((res) => {
    window.location.href = res.data;
  });
};

export const getUser = async (token: string): Promise<UserResponse> => {
  const user = await axios.get(`user/data/all/${token}`);
  return user.data as UserResponse;
};

export const getUserDegree = async (token: string): Promise<DegreeResponse> => {
  const degree = await axios.get(`user/data/degree/${token}`);
  return degree.data as DegreeResponse;
};

export const setIsComplete = async (
  token: string,
  isComplete: boolean
): Promise<Record<never, never>> => {
  await axios.put(`user/setIsComplete`, {}, { params: { token, isComplete } });
  return {};
};

export const getUserPlanner = async (token: string): Promise<PlannerResponse> => {
  const planner = await axios.get(`user/data/planner/${token}`);
  return planner.data as PlannerResponse;
};

export const getUserCourses = async (token: string): Promise<CoursesResponse> => {
  const courses = await axios.get(`user/data/courses/${token}`);
  return courses.data as CoursesResponse;
};

export const resetUserDegree = async (token: string): Promise<void> => {
  await axios.post(`user/reset`, {}, { params: { token } });
};
