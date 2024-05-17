import axios from 'axios';
import { CoursesResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';
import { withAuthorization } from './auth';

export const initiateCSEAuth = async (): Promise<void> => {
  // Login to redirect link
  await axios.get<string>('/auth/authorization_url', { withCredentials: true }).then((res) => {
    window.location.href = res.data;
  });
};

export const getUser = async (token: string): Promise<UserResponse> => {
  const user = await axios.get(`user/data/all`, { headers: { ...withAuthorization(token) } });
  return user.data as UserResponse;
};

export const getUserDegree = async (token: string): Promise<DegreeResponse> => {
  const degree = await axios.get(`user/data/degree`, { headers: { ...withAuthorization(token) } });
  return degree.data as DegreeResponse;
};

export const getUserIsSetup = async (token: string): Promise<boolean> => {
  const res = await axios.get<boolean>('/user/isSetup', {
    headers: { ...withAuthorization(token) }
  });

  return res.data;
};

export const getUserPlanner = async (token: string): Promise<PlannerResponse> => {
  const planner = await axios.get(`user/data/planner`, {
    headers: { ...withAuthorization(token) }
  });
  return planner.data as PlannerResponse;
};

export const getUserCourses = async (token: string): Promise<CoursesResponse> => {
  const courses = await axios.get(`user/data/courses`, {
    headers: { ...withAuthorization(token) }
  });
  return courses.data as CoursesResponse;
};

export const resetUserDegree = async (token: string): Promise<void> => {
  await axios.post(`user/reset`, {}, { headers: { ...withAuthorization(token) } });
};
