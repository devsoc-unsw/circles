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
    // eslint-disable-next-line no-console
    .catch((err) => console.log(err));
};

const prepareCoursesForValidation = (plannerInfo, userInfo) => {
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
    mostRecentPastTerm: getMostRecentPastTerm(startYear),
  };

  return payload;
};

const updateAllWarnings = (dispatch, plannerInfo, userInfo) => {
  const payload = prepareCoursesForValidation(plannerInfo, userInfo);
  dispatch(validateTermPlanner(payload));
};

export default updateAllWarnings;
