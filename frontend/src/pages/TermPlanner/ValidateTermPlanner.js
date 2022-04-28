import axios from "axios";
import { toggleWarnings } from "../../reducers/plannerSlice";
import getMostRecentPastTerm from "./PastTerm";

const validateTermPlanner = (payload) => (dispatch) => {
  axios
    .post(
      "/planner/validateTermPlanner/",
      JSON.stringify(payload),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
    .then(({ data }) => {
      dispatch(toggleWarnings(data.courses_state));
    })
    // eslint-disable-next-line no-console
    .catch((err) => console.log(err));
};

const prepareCoursesForValidation = (plannerInfo, userInfo, supress) => {
  const { years, startYear } = plannerInfo;
  const { programCode, specialisation, minor } = userInfo;

  const plan = [];
  years.forEach((year) => {
    const formattedYear = [];
    Object.values(year).forEach((term) => {
      const courses = {};
      Object.values(term).forEach((course) => {
        courses[course] = null; // TODO: turn into course mark
      });
      formattedYear.push(courses);
    });
    plan.push(formattedYear);
  });

  const payload = {
    program: programCode,
    specialisations: [specialisation, minor],
    year: 1,
    plan,
    mostRecentPastTerm: supress ? getMostRecentPastTerm(startYear) : { Y: 0, T: 0 },
  };

  return payload;
};

const updateAllWarnings = (dispatch, plannerInfo, userInfo, supress) => {
  const payload = prepareCoursesForValidation(plannerInfo, userInfo, supress);
  dispatch(validateTermPlanner(payload));
};

export default updateAllWarnings;
