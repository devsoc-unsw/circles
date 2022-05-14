/**
 * IMPORTANT NOTE:
 *
 * Only increment REDUX_PERSIST_VERSION whenever there is an underlying change to the
 * state structure saved to local storage for redux-persist.
 * OR if you would want a clean refresh for all users to use Circles
 * (i.e. reset all user's degree plan/courses due to breaking changes).
 *
 * THESE SHOULD BE RARELY INCREMENTED UNLESS THERE IS A BREAKING CHANGE.
 *
 */
export const REDUX_PERSIST_VERSION = -1;

export const FEEDBACK_LINK = "https://github.com/csesoc/Circles/issues?q=is%3Aissue+is%3Aopen";

// Global colors - currently only being used in LiquidProgressChart
export const lightYellow = "#f9b01e";
export const lightGrey = "#565652";
export const darkGrey = "#323739";
export const yellow = "#FAAD14";
export const purple = "#9254de";

export const inDev = process.env.REACT_APP_ENV === "dev";
