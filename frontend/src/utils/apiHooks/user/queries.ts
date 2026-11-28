import {
  getAllUnlockedCourses,
  getCoursesUnlockedWhenTaken,
  getPopularElectives
} from 'utils/api/coursesApi';
import { validateTermPlanner } from 'utils/api/plannerApi';
import {
  getUserCourses,
  getUserDegree,
  getUserIsSetup,
  getUserPlanner,
  getUserSettings
} from 'utils/api/userApi';
import { createUserQueryHook } from '../hookHelpers';

export const useUserCourses = createUserQueryHook(() => ['planner', 'courses'], getUserCourses);

export const useUserPlanner = createUserQueryHook(() => ['planner'], getUserPlanner);

export const useUserDegree = createUserQueryHook(() => ['degree'], getUserDegree);

export const useUserCoursesUnlockedWhenTaken = createUserQueryHook(
  (courseCode) => ['planner', 'courses', 'unlockedWhenTaken', courseCode],
  getCoursesUnlockedWhenTaken
);

export const useUserTermValidations = createUserQueryHook(
  () => ['planner', 'validation'],
  validateTermPlanner
);

export const useUserSettings = createUserQueryHook(() => ['settings'], getUserSettings);

// Popular electives for the user's own degree (the server reads it from their record)
export const useUserPopularElectives = createUserQueryHook(
  () => ['popular-electives'],
  getPopularElectives
);

export const useUserAllUnlocked = createUserQueryHook(
  () => ['planner', 'courses', 'allUnlocked'],
  getAllUnlockedCourses
);

// TODO-olli: refect on window
export const useUserSetupState = createUserQueryHook(() => ['isSetup'], getUserIsSetup);
