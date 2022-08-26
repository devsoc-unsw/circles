import axios from 'axios';
import { DegreeSliceState } from 'reducers/degreeSlice';
import { PlannerSliceState } from 'reducers/plannerSlice';
import prepareLocalStorageData from './prepareLocalStorageData';

const saveLocalStorageData = (
  planner: PlannerSliceState,
  degree: DegreeSliceState,
  showWarnings: boolean,
): void => {
  try {
    axios.post(
      '/planner/saveLocalStorage/',
      JSON.stringify(prepareLocalStorageData(planner, degree, showWarnings)),
    );
  } catch (err) {
    // console.error('Error at save Local Storage', err);
  }
};
export default saveLocalStorageData;
