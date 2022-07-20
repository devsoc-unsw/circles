import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import G6 from "@antv/g6";
import Spinner from "components/Spinner";
import axios from "axios";
import axiosRequest from "config/axios";
import { addTab } from "reducers/courseTabsSlice";
import TREE_CONSTANTS from "./constants";
import GRAPH_STYLE from "./config";
import { 
  handleNodeData,
  updateEdges,
  bringEdgeLabelsToFront,
  calcHeight,
 } from "./utils"
import prepareUserPayload from "../../pages/CourseSelector/utils";
import S from "./styles";

const PrerequisiteTree = ({ courseCode }) => {
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState(null);
  const [courseAccurate, setCourseAccurate] = useState(true);
  const [courseUnlocks, setCourseUnlocks] = useState([]);
  const [coursesRequires, setCoursesRequires] = useState([]);
  const dispatch = useDispatch();
  const ref = useRef(null);
  const { degree, planner } = useSelector((state) => state);

  /* GRAPH IMPLEMENTATION */
  const generateTreeGraph = (graphData) => {
    const container = ref.current;
    const treeGraphInstance = new G6.TreeGraph({
      container,
      width: container.scrollWidth,
      height: container.scrollHeight,
      fitView: true,
      layout: GRAPH_STYLE.graphLayout,
      defaultNode: GRAPH_STYLE.defaultNode,
      defaultEdge: GRAPH_STYLE.defaultEdge,
    });

    setGraph(treeGraphInstance);

    treeGraphInstance.data(graphData);

    updateEdges(treeGraphInstance, graphData);
    
    treeGraphInstance.render(graphData);
    
    bringEdgeLabelsToFront(treeGraphInstance);
    
    treeGraphInstance.on("node:click", (event) => {
      // open new course tab
      const node = event.item;
      const { _cfg: { model: { label } } } = node;
      dispatch(addTab(label));
    });
  };

  // NOTE: This is for hot reloading in development as new graph will instantiate every time
  const updateTreeGraph = (graphData) => {
    graph.changeData(graphData);
    bringEdgeLabelsToFront(graph);
  };

  /* REQUESTS */
  const getCourseUnlocks = async (c) => {
    const [unlockData, unlockErr] = await axiosRequest(
      "get",
      `/courses/courseChildren/${c}`,
    );
    if (!unlockErr) {
      return unlockData.courses;
    }
  };

  const getCoursePrereqs = async (c) => {
    const [prereqData, prereqErr] = await axiosRequest(
      "get",
      `/courses/getPathFrom/${c}`,
    );
    if (!prereqErr) {
      return prereqData.courses;
    }
  };

  const determineCourseAccuracy = async () => {
    try {
      const res = await axios.post(
        "/courses/getAllUnlocked/",
        JSON.stringify(prepareUserPayload(degree, planner)),
      );
      setCourseAccurate(res.data.courses_state[courseCode]?.is_accurate);
    } catch (err) {
      // eslint-disable-next-line
      console.log(err);
    }
  };

  /* MAIN */
  const setupGraph = async (c) => {
    setLoading(true);

    const unlocks = await getCourseUnlocks(c);
    if (unlocks) setCourseUnlocks(unlocks);
    const prereqs = await getCoursePrereqs(c);
    if (prereqs) setCoursesRequires(prereqs);

    // create graph data
    const graphData = {
      id: 'root',
      label: courseCode,
      children: prereqs?.map((child) => (handleNodeData(child, TREE_CONSTANTS.PREREQ)))
        .concat(unlocks?.map((child) => (handleNodeData(child, TREE_CONSTANTS.UNLOCKS)))),
    };

    // render graph
    if (!graph) {
      generateTreeGraph(graphData);
    } else {
      // NOTE: This is for hot reloading in development as new graph will instantiate every time
      updateTreeGraph(graphData);
    }

    setLoading(false);
  };

  useEffect(() => {
    determineCourseAccuracy();

    if (courseCode) setupGraph(courseCode);
  }, [courseCode]);

  return (
    <>
      {!courseAccurate ? (
        <p>We could not parse the prerequisite requirements for this course</p>
      ) : (
        <S.PrereqTreeContainer ref={ref} height={calcHeight(coursesRequires, courseUnlocks)}>
          {loading && <Spinner text="Loading tree..." />}
        </S.PrereqTreeContainer>
      )}
    </>
  )
};

export default PrerequisiteTree;
