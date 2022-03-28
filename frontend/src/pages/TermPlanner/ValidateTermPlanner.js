import { plannerActions } from "../../actions/plannerActions";
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

// takes in startYear (int) and gets current date to return the most recent term that has past (week 2)
// string of year in degree (not array index) and term most recent is returned e.g. 'Y3T0'
const getMostRecentPastTerm = (startYear) => {
  let currTime = new Date();
  let currYear = currTime.getFullYear();
  let currMonth = currTime.getMonth();
  let currDay = currTime.getDate();

  const currDegreeYear = currYear - startYear + 1;

  // session dates gathered from: https://www.student.unsw.edu.au/teaching-periods
  let pastTerm;
  if ((currDay > 29 && currMonth == 8) || currMonth > 8) {
    pastTerm = 3;
  } else if ((currDay > 14 && currMonth == 5) || currMonth > 5) {
    pastTerm = 2;
  } else if ((currDay >= 28 && currMonth == 1) || currMonth > 1) {
    pastTerm = 1;
  } else {
    pastTerm = 0;
  }

  return `Y${currDegreeYear}T${pastTerm}`;
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
