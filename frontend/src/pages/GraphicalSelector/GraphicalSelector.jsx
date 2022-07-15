import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import G6 from "@antv/g6";
import { Button } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import Spinner from "components/Spinner";
import axiosRequest from "config/axios";
import S from "./styles";

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state) => state.degree);

  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);

  const ref = useRef(null);

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
      defaultNode: {
        size: 70,
        style: {
          fill: "#9254de",
          stroke: "#9254de",
          cursor: "pointer",
        },
        labelCfg: {
          style: {
            fill: "#fff",
            fontFamily: "Segoe UI",
            cursor: "pointer",
          },
        },

      },
    });

    setGraph(graphInstance);

    const data = {
      nodes: courses.map((c) => ({ id: c, label: c })),
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
    });
  };

  const setupGraph = async () => {
    const { structure } = (
      await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}`)
    ).data;
    const courseList = (
      Object.values(structure)
        .flatMap((specialisation) => Object.values(specialisation)
          .filter((spec) => typeof spec === "object" && spec.courses && !spec.type.includes("rule"))
          .flatMap((spec) => Object.keys(spec.courses)))
        .filter((v, i, a) => a.indexOf(v) === i) // TODO: hack to make courseList unique
    );
    const res = await Promise.all(courseList.map((c) => axios.get(`/courses/getPathFrom/${c}`).catch((e) => e)));
    // filter any errors from res
    const children = res.filter((value) => value?.data?.courses).map((value) => value.data);
    const edges = children
      .flatMap((courseObject) => courseObject.courses
        .filter((c) => courseList.includes(c))
        .map((c) => ({ source: courseObject.original, target: c })));
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
