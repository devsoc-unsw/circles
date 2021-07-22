const initialState = {
  unplanned: [
    "COMP1511",
    "MATH1131",
    "COMP3331",
    "ENGG1000",
    "COMP2041",
    "COMP3311",
    "COMP3601",
  ],
  //   unplanned: new Map(),
  planned: new Map(),
  startYear: 2021,
  numYears: 3,
  years: [
    { t1: [], t2: [], t3: [] },
    { t1: [], t2: [], t3: [] },
    { t1: [], t2: [], t3: [] },
  ],
  courses: {
    COMP3821: {
      title: "Extended algorithms and programming techniques",
      type: "Core",
      termsOffered: ["t1"],
    },
    ARTS4268: {
      title: "Methodologies in the Social Sciences: Questions and Quandaries",
      type: "General Education",
      termsOffered: ["t1", "t2"],
    },
    COMP1511: {
      title: "Programming Fundamentals",
      type: "Core",
      termsOffered: ["t1", "t2", "t3"],
    },
    CHEM1011: {
      title: "Chemistry 1A",
      type: "Elective",
      termsOffered: ["t1", "t2", "t3"],
    },
    MATH1131: {
      title: "Mathematics 1A",
      type: "Core",
      termsOffered: ["t1", "t2", "t3"],
    },
    BIOC2201: {
      title: "Biochemistry",
      type: "Elective",
      termsOffered: ["t3"],
    },
    ENGG1000: {
      title: "Introduction to Engineering Design and Innovation",
      type: "Core",
      termsOffered: ["t1", "t3"],
    },
    COMP2041: {
      title: "Software Construction: Techniques and Tools",
      type: "Core",
      termsOffered: ["t1"],
    },
    COMP4441: {
      title: "Random Course",
      type: "General Education",
      termsOffered: ["t1", "t2", "t3"],
    },
    COMP3131: {
      title: "Programming Languages and Compilers",
      type: "Elective",
      termsOffered: ["t3"],
    },
    COMP3601: {
      title: "Design Project A",
      type: "Elective",
      termsOffered: ["t1", "t2"],
    },
    COMP3331: {
      title: "Computer Networks and Applications",
      type: "Core",
      termsOffered: ["t1", "t2", "t3"],
    },
    COMP3311: {
      title: "Database Systems",
      type: "Core",
      termsOffered: ["t1", "t3"],
    },
  },
};
const plannerReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_COURSES":
      return { ...state, initialCourses: action.payload };
    case "SET_COURSE":
      return { ...state, course: action.payload };

    case "DELETE":
      return state.filter((value, index) => {
        return value !== action.payload;
      });
    default:
      return state;
    //     case "ADD_UNPLANNED":
    //       console.log("adding course to planner", action.payload);
    //       return {
    //         ...state,
    //         unplanned: state.unplanned.set(
    //           action.payload.courseCode,
    //           action.payload.courseData
    //         ),
    //       };
  }
};

export default plannerReducer;
