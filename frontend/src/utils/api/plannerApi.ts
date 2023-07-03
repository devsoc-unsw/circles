import axios from 'axios';
import { PlannedToTerm, UnPlannedToTerm } from 'types/planner';
import { getToken } from './userApi';

// TODO: Use mutators to invalidate things
// (similar to https://github.com/csesoc/circles/compare/CIRCLES-331/user-data-to-backend...updateStartYear-query)

export const handleAddToUnplanned = async (courseId: string) => {
  const token = await getToken();
  try {
    await axios.post('planner/addToUnplanned', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleAddToUnplanned: ', err);
  }
};

export const handleSetPlannedCourseToTerm = async (data: PlannedToTerm) => {
  const token = getToken();
  try {
    await axios.post('planner/plannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleSetPlannedCourseToTerm: ', err);
  }
};

export const handleSetUnplannedCourseToTerm = async (data: UnPlannedToTerm) => {
  const token = getToken();
  try {
    await axios.post('planner/unPlannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleSetUnplannedCourseToTerm: ', err);
  }
};

export const handleUnscheduleCourse = async (courseid: string) => {
  const token = getToken();
  try {
    await axios.post('planner/unscheduleCourse', { courseCode: courseid }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleUnscheduleCourse: ', err);
  }
};

export const handleUnscheduleAll = async () => {
  const token = getToken();
  try {
    await axios.post('planner/unscheduleAll', {}, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleUnscheduleAll: ', err);
  }
};

export default { handleAddToUnplanned };
