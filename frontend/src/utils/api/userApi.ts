import axios from 'axios';
import { getStoredState } from 'redux-persist';
import { CourseResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';
import { persistConfig, RootState } from 'config/store';

// export const getToken = (): string => useSelector((state: RootState) => state.settings.token);
export const getToken = async (): Promise<string> => {
  // const x = window.localStorage.getItem('persi');
  const res = await getStoredState(persistConfig);
  const store = res as RootState;

  return store.settings.token;
};

export const getUser = async (): Promise<UserResponse> => {
  const token = await getToken();
  const user = await axios.get<UserResponse>(`user/data/all/${token}`);
  return user.data;
};

export const getUserDegree = async (): Promise<DegreeResponse> => {
  const token = await getToken();
  const degree = await axios.get<DegreeResponse>(`user/data/degree/${token}`);
  return degree.data;
};

export const getUserPlanner = async (): Promise<PlannerResponse> => {
  const token = await getToken();
  const planner = await axios.get<PlannerResponse>(`user/data/planner/${token}`);
  return planner.data;
};

export const getUserCourses = async (): Promise<CourseResponse> => {
  const token = await getToken();
  const courses = await axios.get<CourseResponse>(`user/data/courses/${token}`);
  return courses.data;
};
