import { plannerActions } from "../../actions/plannerActions";
import { getMostRecentPastTerm } from "./PastTerm"
import axios from "axios";

export const updateAllWarnings = (dispatch, plannerInfo, userInfo) => {
  const payload = prepareCoursesForValidation(plannerInfo, userInfo);
  dispatch(validateTermPlanner(payload));
};

const validateTermPlanner = (payload) => {
  return (dispatch) => {
    axios
      .post(
        `/planner/validateTermPlanner/`,
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then(({ data }) => {
        dispatch(plannerActions("TOGGLE_WARNINGS", data.courses_state));
      })
      .catch((err) => console.log(err));
  };
};

const prepareCoursesForValidation = (plannerInfo, userInfo) => {
  const { years, startYear, _ } = plannerInfo;
  const { programCode, specialisation, minor } = userInfo;

  let plan = [];
  for (const year of years) {
    const formattedYear = [];
    for (const term in year) {
      let courses = {};
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
    plan: plan,
    mostRecentPastTerm: getMostRecentPastTerm(startYear),
  };

  return payload;
};
