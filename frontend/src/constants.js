/**
 * IMPORTANT NOTE:
 *
 * Only increment DEGREE_STRUCTURE_VERSION and PLANNER_STRUCTURE_VERSION whenever
 * there is an underlying change to the state structure for the degree in degreeSlice.js
 * and the planner in plannerSlice.js OR if you would want a clean refresh for all users
 * to use Circles (i.e. reset all user's degree plan/courses due to breaking changes).
 *
 * THESE SHOULD BE RARELY INCREMENTED UNLESS THERE IS A BREAKING CHANGE.
 *
 * TODO: Before deployment, set these to version 0.
 *
 */
export const DEGREE_STRUCTURE_VERSION = -1;
export const PLANNER_STRUCTURE_VERSION = -1;

export const FEEDBACK_LINK = "https://github.com/csesoc/Circles/issues?q=is%3Aissue+is%3Aopen";
