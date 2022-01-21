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
        `http://localhost:8000/planner/validateTermPlanner/`,
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
  const { years, startYear, completedTerms } = plannerInfo;

  let plan = [];
  let currYear = startYear;
  for (const year of years) {
    const formattedYear = [];
    // console.log(year);
    let termNum = 0;
    for (const term in year) {
      const yearTerm = `${currYear}T${termNum}`;
      let courses = {};
      for (const course of year[term]) {
        courses[course] = [6, null];
      }
      const formattedTerm = {
        locked: completedTerms.get(yearTerm) === true ? true : false,
        courses: courses,
      };

      formattedYear.push(formattedTerm);
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
