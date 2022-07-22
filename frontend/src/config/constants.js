import { getMostRecentPastTerm } from "pages/TermPlanner/utils";

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
export const REDUX_PERSIST_VERSION = 3;

export const FEEDBACK_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSdGoxb-1fRRLySEi5j4Gy_ERWt3XWTBwyKJaDWlTqhy8Xdlxw/viewform?usp=sf_link";

export const TERM = `${new Date().getFullYear() + (getMostRecentPastTerm().T === 3 ? 1 : 0)}-T${(getMostRecentPastTerm().T + 1) % 3}`;
export const TIMETABLE_API_URL = `https://timetable.csesoc.app/api/terms/${TERM}/courses`;

// Global colors - currently only being used in LiquidProgressChart
export const lightYellow = "#f9b01e";
export const lightGrey = "#565652";
export const darkGrey = "#323739";
export const yellow = "#FAAD14";
export const purple = "#9254de";
export const lightPurple = "#efdbff";

export const inDev = import.meta.env.VITE_ENV === "dev";
