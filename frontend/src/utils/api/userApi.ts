import axios from 'axios';
import { getStoredState } from 'redux-persist';
import { CourseResponse, DegreeResponse, PlannerResponse, UserResponse } from 'types/userResponse';
import { persistConfig, RootState } from 'config/store';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken } from 'reducers/settingsSlice';

// export const getToken = (): string => useSelector((state: RootState) => state.settings.token);
export const getToken = async (): Promise<string> => {
  // const x = window.localStorage.getItem('persi');
  const res = await getStoredState(persistConfig);
  const store = res as RootState;

  return store.settings.token;
};

export const userLogout = async (): Promise<void> => {
  const navigate = useNavigate();
  const token = await getToken();
  await axios.post('/auth/logout', token, {withCredentials: true}).then(() => navigate('/'))
}

export const userLogin = async (): Promise<void> => { 
  // Login to redirect link
  await axios.get<string>('/auth/authorization_url', {withCredentials: true}).then((res) => window.location.href = res.data);
}

export const generateUserToken = async (token: number): Promise<void> => {
  const dispatch = useDispatch();
  await axios.get<string>(`/auth/dev_token/${token}`, {withCredentials: true}).then(res => dispatch(setToken(res.data)))
}

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
