import { plannerActions } from "../../actions/plannerActions";
import axios from "axios";

export const updateAllWarnings = (dispatch, plannerInfo) => {
  const payload = prepareCoursesForValidation(plannerInfo);
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

const prepareCoursesForValidation = (plannerInfo) => {
  const { years, startYear, _ } = plannerInfo;

  let plan = [];
  let currYear = startYear;
  for (const year of years) {
    const formattedYear = [];
    let termNum = 0;
    for (const term in year) {
      let courses = {};
      for (const course of year[term]) {
        courses[course] = [6, null];
      }

      formattedYear.push(courses);
      termNum++;
    }
    plan.push(formattedYear);
    currYear++;
  }

  const payload = {
    program: "3707",
    specialisations: ["COMPA1"],
    year: 1,
    plan: plan,
  };

  return payload;
};
