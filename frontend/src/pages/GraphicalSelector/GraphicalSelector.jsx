/* eslint-disable */

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import G6, { Algorithm } from "@antv/g6";
import { Button } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import Spinner from "components/Spinner";
import axiosRequest from "config/axios";
import GRAPH_STYLE from "./config";
import S from "./styles";
import handleNodeData from "./utils";

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state) => state.degree);
  const { courses: plannedCourses } = useSelector((state) => state.planner);

  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  const ref = useRef(null);

  // courses is a list of course codes
  const initialiseGraph = (courses, courseEdges) => {
    const container = ref.current;
    const graphInstance = new G6.Graph({
      container,
      width: container.scrollWidth,
      height: container.scrollHeight,
      linkCenter: true,
      modes: {
        default: [
          "drag-canvas",
          "zoom-canvas",
          // "drag-node",
        ],
      },
      layout: {
        type: "comboCombined",
        preventOverlap: true,
        nodeSpacing: 10,
        linkDistance: 500,
      },
      // animate: true,
      defaultNode: GRAPH_STYLE.defaultNode,
      defaultEdge: GRAPH_STYLE.defaultEdge,
      nodeStateStyles: GRAPH_STYLE.nodeStateStyles,
    });

    setGraph(graphInstance);

    const data = {
      nodes: courses.map((c) => handleNodeData(c, plannedCourses)),
      edges: courseEdges,
    };

    graphInstance.data(data);
    graphInstance.render();

    graphInstance.on("node:click", async (ev) => {
      // load up course information
      const node = ev.item;
      const { _cfg: { id } } = node;
      const [courseData, err] = await axiosRequest("get", `/courses/getCourse/${id}`);
      if (!err) setCourse(courseData);

      // hides/ unhides dependent nodes
      const { breadthFirstSearch } = Algorithm;
      if (node.hasState("click")) {
        graphInstance.clearItemStates(node, "click");
        breadthFirstSearch(data, id, {
          enter: ({ current }) => {
            if (id !== current) {
              const currentNode = graphInstance.findById(current);
              // Unhiding node won't unhide other hidden nodes
              currentNode.getEdges().forEach((e) => e.show());
              currentNode.show();
            }
          },
        });
      } else if (node.getOutEdges().length) {
        graphInstance.setItemState(node, "click", true);
        breadthFirstSearch(data, id, {
          enter: ({ current }) => {
            if (id !== current) {
              const currentNode = graphInstance.findById(current);
              currentNode.getEdges().forEach((e) => e.hide());
              currentNode.hide();
            }
          },
        });
      }
    });

    graphInstance.on("node:mouseenter", async (ev) => {
      const node = ev.item;
      graphInstance.setItemState(node, "hover", true);
    });

    graphInstance.on("node:mouseleave", async (ev) => {
      const node = ev.item;
      graphInstance.clearItemStates(node, "hover");
    });
  };

  const setupGraph = async () => {
    const { courses: courseList } = (
      await axios.get(`/programs/getStructureCourseList/${programCode}/${specs.join("+")}`)
    ).data;

    // TODO: Move this to the backend too
    // should be a universal /programs/getGraphEdges/{programCode}/{specs}
    // const courseList = (
    //   Object.values(structure)
    //     .flatMap((specialisation) => Object.values(specialisation)
    //       .filter((spec) => typeof spec === "object" && spec.courses &&
    //         !(spec.type.includes("rule") || spec.type.includes("gened")))
    //       .flatMap((spec) => Object.keys(spec.courses)))
    //     .filter((v, i, a) => a.indexOf(v) === i) // TODO: hack to make courseList unique
    // );
    const res = await Promise.all(courseList.map((c) => axios.get(`/courses/getPathFrom/${c}`).catch((e) => e)));
    
    const justData = res.data();


    // filter any errors from res
    const children = res.filter((value) => value?.data?.courses).map((value) => value.data);
    const edges = children
      .flatMap((courseObject) => courseObject.courses
        .filter((c) => courseList.includes(c))
        .map((c) => ({ source: c, target: courseObject.original })));
    if (courseList.length !== 0 && edges.length !== 0) initialiseGraph(courseList, edges);
    setLoading(false);
  };

  useEffect(() => {
    if (programCode) setupGraph();
  }, []);

  const handleShowGraph = () => {
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    nodes.forEach((n) => n.show());
    edges.forEach((e) => e.show());
  };

  const handleHideGraph = () => {
    const nodes = graph.getNodes();
    const edges = graph.getEdges();
    nodes.forEach((n) => n.hide());
    edges.forEach((e) => e.hide());
  };

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.GraphPlaygroundWrapper ref={ref}>
          {loading && <Spinner text="Loading graph..." />}
        </S.GraphPlaygroundWrapper>
        <S.SidebarWrapper>
          <Button onClick={handleShowGraph}>
            Show Graph
          </Button>
          <Button onClick={handleHideGraph}>
            Hide Graph
          </Button>
          <div>
            {course ? <div>{course.code} - {course.title}</div> : "No course selected"}
          </div>
        </S.SidebarWrapper>
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
