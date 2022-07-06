import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import G6 from "@antv/g6";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import S from "./styles";

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state) => state.degree);

  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  const initialiseGraph = (courses, courseEdges) => {
    const container = ref.current;
    const width = container.scrollWidth;
    const height = container.scrollHeight;
    const graphInstance = new G6.Graph({
      container,
      width,
      height,
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

    graphInstance.on("node:click", (ev) => {
      // hide the node when clicked
      const node = ev.item;
      node.hide();
      graph.paint();
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
    );
    const res = await Promise.all(courseList.map((c) => axios.get(`/courses/getPathFrom/${c}`).catch((e) => e)));
    // filter any errors from res
    const children = res.filter((value) => value?.data?.courses).map((value) => value.data);
    const edges = children
      .flatMap((courseObject) => courseObject.courses
        .filter((course) => courseList.includes(course))
        .map((course) => ({ source: courseObject.original, target: course })));
    if (courseList.length !== 0 && edges.length !== 0) initialiseGraph(courseList, edges);
    setLoading(false);
  };

  useEffect(() => {
    if (programCode) setupGraph();
  }, []);

  return (
    <PageTemplate>
      {loading ? "This page is loading..." : (
        <>
          <button
            type="button"
            onClick={() => {
              const nodes = graph.getNodes();
              const edges = graph.getEdges();
              nodes.forEach((n) => n.hide());
              edges.forEach((e) => e.hide());
            }}
          >
            Hide all nodes and edges
          </button>
          <button
            type="button"
            onClick={() => {
              const nodes = graph.getNodes();
              const edges = graph.getEdges();
              nodes.forEach((n) => n.show());
              edges.forEach((e) => e.show());
            }}
          >
            Show all nodes and edges
          </button>
        </>
      )}
      <S.Wrapper ref={ref} />
    </PageTemplate>
  );
};

export default GraphicalSelector;
