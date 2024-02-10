import axios from 'axios';
// import { persistConfig, RootState } from 'config/store';
// import { getStoredState } from 'redux-persist';
import { CourseResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';
import { v4 } from 'uuid';
import { getToken as getTokenReal } from './auth';

export const getToken = async (): Promise<string> => Promise.resolve(getTokenReal());
// export const getToken = async (): Promise<string> => {
//   const res = await getStoredState(persistConfig);
//   const store = res as RootState;
//   return store.settings.token;
// };

export const userLogin = async (): Promise<void> => {
  // Login to redirect link
  await axios.get<string>('/auth/authorization_url', { withCredentials: true }).then((res) => {
    window.location.href = res.data;
  });
};

export const generateUserToken = async (token: string = v4()): Promise<string> => {
  await axios.post<string>(`/auth/token`, {}, { params: { token }, withCredentials: true });
  return token;
};

export const getUser = async (): Promise<UserResponse> => {
  const token = getTokenReal();
  const user = await axios.get(`user/data/all/${token}`);
  return user.data as UserResponse;
};

export const getUserDegree = async (): Promise<DegreeResponse> => {
  const token = getTokenReal();
  const degree = await axios.get(`user/data/degree/${token}`);
  return degree.data as DegreeResponse;
};

export const setIsComplete = async (isComplete: boolean): Promise<Record<never, never>> => {
  const token = await getToken();
  await axios.put(`user/setIsComplete`, {}, { params: { token, isComplete } });
  return {};
};

export const getUserPlanner = async (): Promise<PlannerResponse> => {
  const token = getTokenReal();
  const planner = await axios.get(`user/data/planner/${token}`);
  return planner.data as PlannerResponse;
};

export const getUserCourses = async (): Promise<CourseResponse> => {
  const token = getTokenReal();
  const courses = await axios.get(`user/data/courses/${token}`);
  return courses.data as CourseResponse;
};
