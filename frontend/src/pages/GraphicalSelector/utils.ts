import GRAPH_STYLE from './config';

// plannedCourses is an object of with keys of courseCodes
const handleNodeData = (courseCode, plannedCourses) => {
  // determine if planned or unplanned
  if (plannedCourses[courseCode]) {
    // uses default node style
    return { id: courseCode, label: courseCode };
  }
  return GRAPH_STYLE.unplannedNodeAdditionalStyle(courseCode);
};

export default handleNodeData;
