import axios from 'axios';
import { PlannedToTerm, UnPlannedToTerm, UnscheduleCourse } from 'types/planner';
import { ValidatesResponse } from 'types/userResponse';

export const addToUnplanned = async (token: string, courseId: string) => {
  try {
    await axios.post('planner/addToUnplanned', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at addToUnplanned: ', err);
  }
};

export const setPlannedCourseToTerm = async (token: string, data: PlannedToTerm) => {
  try {
    await axios.post('planner/plannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at setPlannedCourseToTerm: ', err);
  }
};

export const setUnplannedCourseToTerm = async (token: string, data: UnPlannedToTerm) => {
  try {
    await axios.post('planner/unPlannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleSetUnplannedCourseToTerm: ', err);
  }
};

export const unscheduleCourse = async (token: string, data: UnscheduleCourse) => {
  try {
    await axios.post(
      'planner/unscheduleCourse',
      { courseCode: data.courseCode },
      { params: { token } }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleUnscheduleCourse: ', err);
  }
};

export const unscheduleAll = async (token: string) => {
  try {
    await axios.post('planner/unscheduleAll', {}, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleUnscheduleAll: ', err);
  }
};

export const removeCourse = async (token: string, courseId: string) => {
  try {
    await axios.post('planner/removeCourse', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at removeCourse: ', err);
  }
};

export const toggleIgnoreFromProgression = async (token: string, courseId: string) => {
  try {
    await axios.post(
      'planner/toggleIgnoreFromProgression',
      { courseCode: courseId },
      { params: { token } }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at toggleIgnoreFromProgression: ', err);
  }
};

export const removeAll = async (token: string) => {
  try {
    await axios.post('planner/removeAll', {}, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at removeAll: ', err);
  }
};

export const validateTermPlanner = async (token: string): Promise<ValidatesResponse> => {
  const res = await axios.get('planner/validateTermPlanner', { params: { token } });
  return res.data as ValidatesResponse;
};
