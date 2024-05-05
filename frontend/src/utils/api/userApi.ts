import axios from 'axios';
import { getStoredState } from 'redux-persist';
import { CoursesResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';
import { persistConfig, RootState } from 'config/store';

// import { getToken as getTokenReal } from './auth';

// export const getToken = async (): Promise<string> => Promise.resolve(getTokenReal());
export const getToken = async (): Promise<string | undefined> => {
  const res = await getStoredState(persistConfig);
  const store = res as RootState;
  return store.identity?.token; // TODO: THIS WILL NOT WORK, MAKE THEM TAKE IN TOKEN AS PARAM
};

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
