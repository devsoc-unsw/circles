import axios from 'axios';
import { getStoredState } from 'redux-persist';
import { CoursesResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';
import { persistConfig, RootState } from 'config/store';

export const getToken = async (): Promise<string> => {
  const res = await getStoredState(persistConfig);
  const store = res as RootState;
  return store.settings.token;
};

export const getUser = async (): Promise<UserResponse> => {
  const token = await getToken();
  const user = await axios.get(`user/data/all/${token}`);
  return user.data as UserResponse;
};

export const getUserDegree = async (): Promise<DegreeResponse> => {
  const token = await getToken();
  const degree = await axios.get(`user/data/degree/${token}`);
  return degree.data as DegreeResponse;
};

export const setIsComplete = async (isComplete: boolean): Promise<Record<never, never>> => {
  const token = await getToken();
  await axios.put(`user/setIsComplete`, {}, { params: { token, isComplete } });
  return {};
};

export const getUserPlanner = async (): Promise<PlannerResponse> => {
  const token = await getToken();
  const planner = await axios.get(`user/data/planner/${token}`);
  return planner.data as PlannerResponse;
};

export const getUserCourses = async (): Promise<CoursesResponse> => {
  const token = await getToken();
  const courses = await axios.get(`user/data/courses/${token}`);
  return courses.data as CoursesResponse;
};
