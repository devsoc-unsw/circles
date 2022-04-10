import axios from "axios";
import plannerActions from "../../actions/plannerActions";
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
      dispatch(plannerActions("TOGGLE_WARNINGS", data.courses_state));
    })
    .catch((err) => console.log(err));
};

const prepareCoursesForValidation = (plannerInfo, userInfo) => {
  const { years, startYear } = plannerInfo;
  const { programCode, specialisation, minor } = userInfo;

  const plan = [];
  for (const year of years) {
    const formattedYear = [];
    for (const term in year) {
      const courses = {};
      for (const course of year[term]) {
        courses[course] = null;
      }

      formattedYear.push(courses);
    }
    plan.push(formattedYear);
  }

  const payload = {
    program: programCode,
    specialisations: [specialisation, minor],
    year: 1,
    plan,
    mostRecentPastTerm: getMostRecentPastTerm(startYear),
  };

  return payload;
};

const updateAllWarnings = (dispatch, plannerInfo, userInfo) => {
  const payload = prepareCoursesForValidation(plannerInfo, userInfo);
  dispatch(validateTermPlanner(payload));
};

export default updateAllWarnings;
