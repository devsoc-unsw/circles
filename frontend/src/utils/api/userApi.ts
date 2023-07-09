import axios from 'axios';
import { getStoredState } from 'redux-persist';
import { CoursesAllUnlocked } from 'types/api';
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
  const user = await axios.get(`user/data/all/${token}`);
  return user.data as UserResponse;
};

export const getUserDegree = async (): Promise<DegreeResponse> => {
  const token = await getToken();
  const degree = await axios.get(`user/data/degree/${token}`);
  return degree.data as DegreeResponse;
};

export const getUserPlanner = async (): Promise<PlannerResponse> => {
  const token = await getToken();
  const planner = await axios.get(`user/data/planner/${token}`);
  return planner.data as PlannerResponse;
};

export const getUserCourses = async (): Promise<CourseResponse> => {
  const token = await getToken();
  const courses = await axios.get(`user/data/courses/${token}`);
  return courses.data as CourseResponse;
};

export const getUsersUnlockedCourses = async (): Promise<CoursesAllUnlocked> => {
  const token = await getToken();
  const unlocked = await axios.get(`user/unlockedCourses/${token}`);
  return unlocked.data as CoursesAllUnlocked;
};
