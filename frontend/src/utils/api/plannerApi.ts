import axios from 'axios';
import { PlannedToTerm, UnPlannedToTerm } from 'types/planner';
import { getToken } from './userApi';

export const addToUnplanned = async (courseId: string) => {
  const token = await getToken();
  try {
    await axios.post('planner/addToUnplanned', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at addToUnplanned: ', err);
  }
};

export const handleSetPlannedCourseToTerm = async (data: PlannedToTerm) => {
  const token = getToken();
  try {
    await axios.post('planner/plannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, no-console
    console.error(`Error at setPlannedCourseToTerm: ${err}`);
  }
};

export const handleSetUnplannedCourseToTerm = async (data: UnPlannedToTerm) => {
  const token = getToken();
  try {
    await axios.post('planner/unPlannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console, @typescript-eslint/restrict-template-expressions
    console.error(`Error at handleSetUnplannedCourseToTerm: ${err}`);
  }
};

export const removeCourse = async (courseId: string) => {
  const token = await getToken();
  try {
    await axios.post('planner/removeCourse', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at removeCourse: ', err);
  }
};
