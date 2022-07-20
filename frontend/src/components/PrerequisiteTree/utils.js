import GRAPH_STYLE from "./config";
import TREE_CONSTANTS from "./constants";

const handleNodeData = (courseName, rootRelationship) => {
  switch (rootRelationship) {
    case TREE_CONSTANTS.PREREQ:
      return GRAPH_STYLE.prereqNodeAddtionalStyle(courseName);
    case TREE_CONSTANTS.UNLOCKS:
      return GRAPH_STYLE.unlocksNodeAddtionalStyle(courseName);
    default:
      return GRAPH_STYLE.unrecognisedNodeAddtionalStyle(courseName);
  }
};

const updateEdges = (graphInstance, graphData) => {
  // edge does not contain node data so ids must be used
  // find target node id that should have label (as defaultEdge changes all edges)
  const prereqs = graphData.children.filter(child => child.rootRelationship === TREE_CONSTANTS.PREREQ);
  const unlocks = graphData.children.filter(child => child.rootRelationship === TREE_CONSTANTS.UNLOCKS);
  
  // get middle node id, if even pick left most (equates to higher one in graph)
  const prereqMiddleCode = prereqs[Math.floor((prereqs.length - 1) / 2)]?.id;
  const unlocksMiddleCode = unlocks[Math.floor((unlocks.length - 1) / 2)]?.id;
  
  // add labels
  graphInstance.edge((edge) => {
    switch (edge.target) {
      case prereqMiddleCode:
        return GRAPH_STYLE.prereqEdgeAdditionalStyle(edge.id);
      case unlocksMiddleCode:
        return GRAPH_STYLE.unlocksEdgeAdditionalStyle(edge.id);
      default:
        return GRAPH_STYLE.defaultEdgeAdditionalStyle(edge.id);
    }
  });
};

const bringEdgeLabelsToFront = (graphInstance) => {
  // bring edges with labels to front 
  graphInstance.getEdges().filter(e => e._cfg.model.hasOwnProperty('label')).forEach(e => e.toFront());
  // Repaint the graph after shifting
  graphInstance.paint();
};

// Calculates height of the prereq container
const calcHeight = (courseRequires, courseUnlocks) => {
  let maxCourseGroupNum = Math.max(courseRequires.length, courseUnlocks.length);
  maxCourseGroupNum = maxCourseGroupNum === 0 ? 1 : maxCourseGroupNum;
  // estimate node height as 40
  return 2 * maxCourseGroupNum;
};

export { 
  handleNodeData,
  updateEdges,
  bringEdgeLabelsToFront,
  calcHeight,
};
