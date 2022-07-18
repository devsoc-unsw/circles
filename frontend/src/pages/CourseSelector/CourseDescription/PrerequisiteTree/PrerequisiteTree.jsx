import React, { useEffect, useRef, useState } from "react";
import G6 from "@antv/g6";
import { useDispatch } from "react-redux";
import { addTab } from "reducers/courseTabsSlice";
import S from "./styles";
import { debounce } from "@antv/xflow-core/es/common/utils";

const PrerequisiteTree = ({ currCourse, coursesPathFrom, coursesPathTo }) => {
  const relationship = {
    PREREQ: "prereq",
    UNLOCKS: "unlocks",
  }
  const [graph, setGraph] = useState(null);
  const dispatch = useDispatch();
  const ref = useRef(null);

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
        getHGap: () => 10,
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
    });

    setGraph(treeGraphInstance);
    treeGraphInstance.read(data);
    // treeGraphInstance.fitCenter();

    treeGraphInstance.on("node:click", (event) => {
      // open new course tab
      const node = event.item;
      console.log(node);
      const { _cfg: { model: { label } } } = node;
      dispatch(addTab(label));
    });
  };

  const updateTreeGraph = (data) => {
    graph.changeData(data);
    // graph.fitCenter();
  };

  const nodeData = (courseName, rootRelationship) => {
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
  }

  useEffect(() => {
    const data = {
      id: 'root',
      label: currCourse,
      children: coursesPathFrom.map((c) => (nodeData(c, relationship.PREREQ)))
        .concat(coursesPathTo.direct_unlock.map((c) => (nodeData(c, relationship.UNLOCKS)))),
    };

    const handleResize = () => {
      debounce(() => {
        graph.fitView(20);
      }, 1000);
    };

    if (!graph) {
      generateTreeGraph(data);
    } else {
      updateTreeGraph(data);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    }
  }, [currCourse, coursesPathFrom, coursesPathTo]);

  return (
    <S.PrereqTreeContainer ref={ref} />
  )
};

export default PrerequisiteTree;