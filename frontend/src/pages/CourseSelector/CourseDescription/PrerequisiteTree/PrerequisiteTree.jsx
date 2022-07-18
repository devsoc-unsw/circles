import React, { useEffect, useRef, useState } from "react";
import G6 from "@antv/g6";
import { useDispatch } from "react-redux";
import { addTab } from "reducers/courseTabsSlice";
import S from "./styles";

// constants
const relationship = {
  PREREQ: "prereq",
  UNLOCKS: "unlocks",
}

const getNodeData = (courseName, rootRelationship) => {
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

const PrerequisiteTree = ({ currCourse, coursesPathFrom, coursesPathTo }) => {
  const [graph, setGraph] = useState(null);
  const dispatch = useDispatch();
  const ref = useRef(null);
  
  // TODO get max height of tree to determine canvas size
  // TODO change edge to match amount of nodes

  const generateTreeGraph = (data) => {
    const container = ref.current;
    const treeGraphInstance = new G6.TreeGraph({
      container: container,
      width: container.scrollWidth,
      height: container.scrollHeight,
      fitView: true,
      fitViewPadding: 20,
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
        type: "polyline", // could change to cubic-horizontal to avoid inconsistent polyline
        color: "#A6A6A6",
        size: 1,
        style: {
          offset: 100,
        },
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
            },
          },
        },
      },
    });

    setGraph(treeGraphInstance);

    treeGraphInstance.data(data);

    // edge updates
    // edge does not contain node data so ids must be used
    // find target node id that should have label (as defaultEdge changes all edges)
    const prereqs = data.children.filter(child => child.rootRelationship === relationship.PREREQ);
    const unlocks = data.children.filter(child => child.rootRelationship === relationship.UNLOCKS);
    
    // get middle node id, if even pick left most (equates to higher one in graph)
    const prereqMiddleCode = prereqs[Math.floor((prereqs.length - 1) / 2)]?.id;
    const unlocksMiddleCode = unlocks[Math.floor((unlocks.length - 1) / 2)]?.id;
    
    // add labels
    treeGraphInstance.edge((edge) => {
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
    
    treeGraphInstance.render(data);
    
    // bring labels to front after rendering
    treeGraphInstance.getEdges().filter(e => e._cfg.model.hasOwnProperty('label')).forEach(e => e.toFront());
    // Repaint the graph after shifting
    treeGraphInstance.paint();
    
    treeGraphInstance.on("node:click", (event) => {
      // open new course tab
      const node = event.item;
      const { _cfg: { model: { label } } } = node;
      dispatch(addTab(label));
    });
  };

  const updateTreeGraph = (data) => {
    graph.changeData(data);
  };

  useEffect(() => {
    const data = {
      id: 'root',
      label: currCourse,
      children: coursesPathFrom?.map((c) => (getNodeData(c, relationship.PREREQ)))
        .concat(coursesPathTo.direct_unlock?.map((c) => (getNodeData(c, relationship.UNLOCKS))))
        .filter(c => c),
    };

    if (!graph) {
      generateTreeGraph(data);
    } else {
      updateTreeGraph(data);
    }

  }, [currCourse, coursesPathFrom, coursesPathTo]);

  return (
    <S.PrereqTreeContainer ref={ref} />
  )
};

export default PrerequisiteTree;