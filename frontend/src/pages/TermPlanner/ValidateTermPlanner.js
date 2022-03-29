import { plannerActions } from "../../actions/plannerActions";
import { FEB, JUN, SEP, MID_MONTH_DAY, START_MONTH_DAY } from "../../constants"
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
  let lastTermPast;
  if ((currDay >= MID_MONTH_DAY + 14 && currMonth == SEP) || currMonth > SEP) {
    lastTermPast = 3;
  } else if ((currDay >= START_MONTH_DAY + 14 && currMonth == JUN) || currMonth > JUN) {
    lastTermPast = 2;
  } else if ((currDay >= MID_MONTH_DAY + 14 && currMonth == FEB) || currMonth > FEB) {
    lastTermPast = 1;
  } else {
    lastTermPast = 0;
  }

  return `Y${currDegreeYear}T${lastTermPast}`;
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
