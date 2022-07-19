import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import G6 from "@antv/g6";
import Spinner from "components/Spinner";
import axiosRequest from "config/axios";
import { addTab } from "reducers/courseTabsSlice";
import S from "./styles";

const PrerequisiteTree = ({ currCourse }) => {
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState(null);
  const [coursesPathTo, setCoursesPathTo] = useState([]);
  const [coursesPathFrom, setCoursesPathFrom] = useState([]);
  const dispatch = useDispatch();
  const ref = useRef(null);
  const { degree, planner } = useSelector((state) => state);

  /* CONSTANTS */
  const relationship = {
    PREREQ: "prereq",
    UNLOCKS: "unlocks",
  }

  /* GRAPH IMPLEMENTATION */
  const getHeight = () => {
    let maxCourseGroupNum = Math.max(coursesPathFrom.length, coursesPathTo.length);
    maxCourseGroupNum = maxCourseGroupNum === 0 ? 1 : maxCourseGroupNum;
    // use node height as 30
    return 30 * maxCourseGroupNum;
  };

  const handleNodeData = (courseName, rootRelationship) => {
    switch (rootRelationship) {
      case relationship.PREREQ:
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
          rootRelationship: relationship.PREREQ, 
        }
      case relationship.UNLOCKS:
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
          rootRelationship: relationship.UNLOCKS, 
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
    const prereqs = graphData.children.filter(child => child.rootRelationship === relationship.PREREQ);
    const unlocks = graphData.children.filter(child => child.rootRelationship === relationship.UNLOCKS);
    
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

  const bringLabelsToFront = (graphInstance) => {
    // bring edges with labels to front 
    graphInstance.getEdges().filter(e => e._cfg.model.hasOwnProperty('label')).forEach(e => e.toFront());
    // Repaint the graph after shifting
    graphInstance.paint();
  };

  const generateTreeGraph = (graphData) => {
    const container = ref.current;
    const treeGraphInstance = new G6.TreeGraph({
      container: container,
      width: container.scrollWidth,
      height: container.scrollHeight,
      fitView: true,
      layout: {
        type: 'mindmap',
        direction: 'H',
        getVGap: () => 5,
        getHGap: () => 100,
        getSide: (node) => {
          if (node.data.rootRelationship === relationship.PREREQ) return "left";
          return "right";
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
        // style: {
        //   offset: 100,
        // },
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
    
    bringLabelsToFront(treeGraphInstance);
    
    treeGraphInstance.on("node:click", (event) => {
      // open new course tab
      const node = event.item;
      const { _cfg: { model: { label } } } = node;
      dispatch(addTab(label));
    });
  };

  const updateTreeGraph = (graphData) => {
    graph.changeData(graphData);
    bringLabelsToFront(graph);
  };

  /* MAIN */
  const setupGraph = async (c) => {
    setLoading(true);
    let unlocks = [];
    let prereqs = [];

    // get all courses a course c unlocks
    // must pass in no courses 
    const { startYear } = planner;
    const { programCode, specs } = degree;
    const specialisations = {};
    specs.forEach((spec) => { specialisations[spec] = 1; });
    
    const [unlockData, unlockErr] = await axiosRequest(
      "post",
      `/courses/coursesUnlockedWhenTaken/${c}`,
      {
        program: programCode,
        specialisations,
        courses: {},
        year: new Date().getFullYear() - startYear,
      },
    );
    if (!unlockErr) {
      // only use direct unlocks
      unlocks = unlockData.direct_unlock;
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
      label: currCourse,
      children: prereqs?.map((child) => (handleNodeData(child, relationship.PREREQ)))
        .concat(unlocks?.map((child) => (handleNodeData(child, relationship.UNLOCKS))))
        .filter(child => child),
    };

    // render graph
    if (!graph) {
      generateTreeGraph(graphData);
    } else {
      updateTreeGraph(graphData);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (currCourse) setupGraph(currCourse);
  }, [currCourse]);

  return (
    <S.PrereqTreeContainer ref={ref} height={getHeight()}>
      {loading && <Spinner text="Loading tree..." />}
    </S.PrereqTreeContainer>
  )
};

export default PrerequisiteTree;
