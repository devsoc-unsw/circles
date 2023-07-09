import axios from 'axios';
import { PlannedToTerm, UnPlannedToTerm } from 'types/planner';
import { getToken } from './userApi';
import { useMutation, useQueryClient } from 'react-query';

const queryClient = useQueryClient();

export const addToUnplanned = async (courseId: string) => {
  const token = await getToken();
  try {
    await axios.post('planner/addToUnplanned', { courseCode: courseId }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at addToUnplanned: ', err);
  }
};

const addToUnplannedMutation = useMutation(addToUnplanned, {
  onSuccess: () => {
    queryClient.invalidateQueries('planner');
  },
  onError: (err) => {
    // eslint-disable-next-line no-console
    console.error('Error at addToUnplannedMutation: ', err);
  }
});

export const handleAddToUnplanned = async (courseId: string) => {
  addToUnplannedMutation.mutate(courseId);
};

const setPlannedCourseToTerm = async (data: PlannedToTerm) => {
  const token = getToken();
  try {
    await axios.post('planner/plannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at setPlannedCourseToTerm: ', err);
  }
};

const setPlannedCourseToTermMutation = useMutation(setPlannedCourseToTerm, {
  onSuccess: () => {
    queryClient.invalidateQueries('planner');
  },
  onError: (err) => {
    // eslint-disable-next-line no-console
    console.error('Error at setPlannedCourseToTermMutation: ', err);
  }
});

export const handleSetPlannedCourseToTerm = async (data: PlannedToTerm) => {
  setPlannedCourseToTermMutation.mutate(data);
};

const setUnplannedCourseToTerm = async (data: UnPlannedToTerm) => {
  const token = getToken();
  try {
    await axios.post('planner/unPlannedToTerm', data, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleSetUnplannedCourseToTerm: ', err);
  }
};

const setUnplannedCourseToTermMutation = useMutation(setUnplannedCourseToTerm, {
  onSuccess: () => {
    queryClient.invalidateQueries('planner');
  },
  onError: (err) => {
    // eslint-disable-next-line no-console
    console.error('Error at setUnplannedCourseToTermMutation: ', err);
  }
});

export const handleSetUnplannedCourseToTerm = async (data: UnPlannedToTerm) => {
  setUnplannedCourseToTermMutation.mutate(data);
};

const unscheduleCourse = async (courseid: string) => {
  const token = getToken();
  try {
    await axios.post('planner/unscheduleCourse', { courseCode: courseid }, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleUnscheduleCourse: ', err);
  }
};

const unscheduleCourseMutation = useMutation(unscheduleCourse, {
  onSuccess: () => {
    queryClient.invalidateQueries('planner');
  },
  onError: (err) => {
    // eslint-disable-next-line no-console
    console.error('Error at unscheduleCourseMutation: ', err);
  }
});

export const handleUnscheduleCourse = async (courseid: string) => {
  unscheduleCourseMutation.mutate(courseid);
};

const unscheduleAll = async () => {
  const token = getToken();
  try {
    await axios.post('planner/unscheduleAll', {}, { params: { token } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error at handleUnscheduleAll: ', err);
  }
};

const unscheduleAllMutation = useMutation(unscheduleAll, {
  onSuccess: () => {
    queryClient.invalidateQueries('planner');
  },
  onError: (err) => {
    // eslint-disable-next-line no-console
    console.error('Error at unscheduleAllMutation: ', err);
  }
});

export const handleUnscheduleAll = async () => {
  unscheduleAllMutation.mutate();
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
