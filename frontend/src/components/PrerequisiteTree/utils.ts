import type { TreeGraph, TreeGraphData } from '@antv/g6';
import { CourseList } from 'types/courses';
import GRAPH_STYLE from './config';
import TREE_CONSTANTS from './constants';

const handleNodeData = (courseName: string, rootRelationship: string) => {
  switch (rootRelationship) {
    case TREE_CONSTANTS.PREREQ:
      return GRAPH_STYLE.prereqNodeAdditionalStyle(courseName);
    case TREE_CONSTANTS.UNLOCKS:
      return GRAPH_STYLE.unlocksNodeAdditionalStyle(courseName);
    default:
      return GRAPH_STYLE.unrecognisedNodeAdditionalStyle(courseName);
  }
};

const updateEdges = (graphInstance: TreeGraph, graphData: TreeGraphData) => {
  if (!graphData.children) return;
  // edge does not contain node data so ids must be used
  // find target node id that should have label (as defaultEdge changes all edges)
  const prereqs = graphData.children.filter(
    (child) => child.rootRelationship === TREE_CONSTANTS.PREREQ
  );
  const unlocks = graphData.children.filter(
    (child) => child.rootRelationship === TREE_CONSTANTS.UNLOCKS
  );

  // get middle node id, if even pick left most (equates to higher one in graph)
  const prereqMiddleCode = prereqs[Math.floor((prereqs.length - 1) / 2)]?.id;
  const unlocksMiddleCode = unlocks[Math.floor((unlocks.length - 1) / 2)]?.id;

  // add labels
  graphInstance.edge((edge) => {
    const edgeId = edge.id as string;
    switch (edge.target) {
      case prereqMiddleCode:
        return GRAPH_STYLE.prereqEdgeAdditionalStyle(edgeId);
      case unlocksMiddleCode:
        return GRAPH_STYLE.unlocksEdgeAdditionalStyle(edgeId);
      default:
        return GRAPH_STYLE.defaultEdgeAdditionalStyle(edgeId);
    }
  });
};

const bringEdgeLabelsToFront = (graphInstance: TreeGraph) => {
  // bring edges with labels to front
  graphInstance
    .getEdges()
    .filter((e) => Object.prototype.hasOwnProperty.call(e.getModel(), 'label'))
    .forEach((e) => e.toFront());
  // Repaint the graph after shifting
  graphInstance.paint();
};

// Calculates height of the prereq container
const calcHeight = (courseRequires: CourseList, courseUnlocks: CourseList) => {
  let maxCourseGroupNum = Math.max(courseRequires.length, courseUnlocks.length);
  maxCourseGroupNum = maxCourseGroupNum === 0 ? 1 : maxCourseGroupNum;
  // estimate node height as 40
  return 2 * maxCourseGroupNum;
};

export { bringEdgeLabelsToFront, calcHeight, handleNodeData, updateEdges };
