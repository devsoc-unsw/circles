import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import G6 from "@antv/g6";
import Spinner from "components/Spinner";
import axios from "axios";
import axiosRequest from "config/axios";
import { addTab } from "reducers/courseTabsSlice";
import prepareUserPayload from "../../utils";
import S from "./styles";

const PrerequisiteTree = ({ courseCode }) => {
  const [loading, setLoading] = useState(true);
  const [courseAccurate, setCourseAccurate] = useState(true);
  const [graph, setGraph] = useState(null);
  const [coursesPathTo, setCoursesPathTo] = useState([]);
  const [coursesPathFrom, setCoursesPathFrom] = useState([]);
  const dispatch = useDispatch();
  const ref = useRef(null);
  const { degree, planner } = useSelector((state) => state);

  /* CONSTANTS */
  const RELATIONSHIP = {
    PREREQ: "prereq",
    UNLOCKS: "unlocks",
  }

  /* GRAPH IMPLEMENTATION */
  // Calculates height of the prereq container
  const getHeight = () => {
    let maxCourseGroupNum = Math.max(coursesPathFrom.length, coursesPathTo.length);
    maxCourseGroupNum = maxCourseGroupNum === 0 ? 1 : maxCourseGroupNum;
    // estimate node height as 40
    return 40 * maxCourseGroupNum;
  };

  const handleNodeData = (courseName, rootRelationship) => {
    switch (rootRelationship) {
      case RELATIONSHIP.PREREQ:
        return {
          id: courseName, 
          label: courseName, 
          style: {
            fill: "#de545b",
            stroke: "#de545b",
          },
          labelCfg: {
            style: {
              fill: "#5e2427",
              fontWeight: "normal",
            },
          },
          rootRelationship: RELATIONSHIP.PREREQ, 
        }
      case RELATIONSHIP.UNLOCKS:
        return {
          id: courseName, 
          label: courseName,
          style: {
            fill: "#a0de54",
            stroke: "#a0de54",
          },
          labelCfg: {
            style: {
              fill: "#445e24",
              fontWeight: "normal",
            },
          },
          rootRelationship: RELATIONSHIP.UNLOCKS, 
        }
      default:
        return {
          id: courseName, 
          label: courseName, 
          rootRelationship: undefined, 
        }
    }
  };

  const updateEdges = (graphInstance, graphData) => {
    // edge does not contain node data so ids must be used
    // find target node id that should have label (as defaultEdge changes all edges)
    const prereqs = graphData.children.filter(child => child.rootRelationship === RELATIONSHIP.PREREQ);
    const unlocks = graphData.children.filter(child => child.rootRelationship === RELATIONSHIP.UNLOCKS);
    
    // get middle node id, if even pick left most (equates to higher one in graph)
    const prereqMiddleCode = prereqs[Math.floor((prereqs.length - 1) / 2)]?.id;
    const unlocksMiddleCode = unlocks[Math.floor((unlocks.length - 1) / 2)]?.id;
    
    // add labels
    graphInstance.edge((edge) => {
      switch (edge.target) {
        case prereqMiddleCode:
          return {
            id: edge.id,
            label: 'is a prereq for',
          };
        case unlocksMiddleCode:
          return {
            id: edge.id,
            label: 'unlocks',
          };
        default:
          return {
            id: edge.id,
          };
      }
    });
  };

  const bringEdgeLabelsToFront = (graphInstance) => {
    // bring edges with labels to front 
    graphInstance.getEdges().filter(e => e._cfg.model.hasOwnProperty('label')).forEach(e => e.toFront());
    // Repaint the graph after shifting
    graphInstance.paint();
  };

  const generateTreeGraph = (graphData) => {
    const container = ref.current;
    const treeGraphInstance = new G6.TreeGraph({
      container,
      width: container.scrollWidth,
      height: container.scrollHeight,
      fitView: true,
      layout: {
        type: 'mindmap',
        direction: 'H',
        getVGap: () => 0,
        getHGap: () => 100,
        getSide: (node) => {
          return node.data.rootRelationship === RELATIONSHIP.PREREQ ? "left" : "right";
        },
      },
      defaultNode: {
        type: "rect",
        style: {
          radius: 5,
          fill: "#9254de",
          stroke: "#9254de",
          cursor: "pointer",
        },
        labelCfg: {
          style: {
            fill: "#fff",
            fontFamily: "Arial",
            fontSize: 14,
            fontWeight: "bold",
            cursor: "pointer",
          },
        },
      },
      defaultEdge: {
        type: "cubic-horizontal", // polyline could be used but pivots are unreliable with lots of courses
        color: "#A6A6A6",
        size: 1,
        labelCfg: {
          refX: 25,
          position: 'start',
          autoRotate: true,
          style: {
            fill: "#595959",
            fontFamily: "Arial",
            fontWeight: "bold",
            fontSize: 14,
            background: {
              fill: '#ffffff',
              padding: [2, 2, 2, 2],
              radius: 5,
            },
          },
        },
      },
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

  const updateTreeGraph = (graphData) => {
    graph.changeData(graphData);
    bringEdgeLabelsToFront(graph);
  };

  /* MAIN */
  const setupGraph = async (c) => {
    setLoading(true);
    let unlocks = [];
    let prereqs = [];

    // get all courses a course c unlocks
    const [unlockData, unlockErr] = await axiosRequest(
      "get",
      `/courses/courseChildren/${c}`,
    );
    if (!unlockErr) {
      // only use direct unlocks
      unlocks = unlockData.courses;
      setCoursesPathTo(unlocks);
    }

    // get prereqs for course c
    const [prereqData, prereqErr] = await axiosRequest(
      "get",
      `/courses/getPathFrom/${c}`,
    );
    if (!prereqErr) {
      prereqs = prereqData.courses;
      setCoursesPathFrom(prereqs);
    }

    // create graph data
    const graphData = {
      id: 'root',
      label: courseCode,
      children: prereqs?.map((child) => (handleNodeData(child, RELATIONSHIP.PREREQ)))
        .concat(unlocks?.map((child) => (handleNodeData(child, RELATIONSHIP.UNLOCKS)))),
    };

    // render graph
    // remove updateTreeGraph when not developing as new graph will instantiate every time
    if (!graph) {
      generateTreeGraph(graphData);
    } else {
      updateTreeGraph(graphData);
    }

    setLoading(false);
  };

  useEffect(() => {
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

    determineCourseAccuracy();
    if (courseCode) setupGraph(courseCode);
  }, [courseCode]);

  return (
    <>
      {!courseAccurate ? (
        <p>We could not parse the prerequisite requirements for this course</p>
      ) : (
        <S.PrereqTreeContainer ref={ref} height={getHeight()}>
          {loading && <Spinner text="Loading tree..." />}
        </S.PrereqTreeContainer>
      )}
    </>
  )
};

export default PrerequisiteTree;
