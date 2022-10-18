import axios from 'axios';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';
import prepareLocalStorageData from './prepareLocalStorageData';

const migrateLocalStorageData = (token: string): void => {
  const data = JSON.parse(localStorage.getItem('persist:root') ?? '{}') as {
    [key: string]: string;
  };
  const degree = JSON.parse(data.degree ?? {}) as DegreeSliceState;
  const planner = JSON.parse(data.planner ?? {}) as PlannerSliceState;
  axios.post(
    '/planner/saveLocalStorage/',
    JSON.stringify(prepareLocalStorageData(planner, degree, token))
  );
};
export default migrateLocalStorageData;
