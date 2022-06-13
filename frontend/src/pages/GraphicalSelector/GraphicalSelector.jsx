import React, { useEffect, useRef, useState } from "react";
import { findDOMNode } from "react-dom";
import { useSelector } from "react-redux";
import G6 from "@antv/g6";
import axios from "axios";

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state) => state.degree);

  const [courses, setCourses] = useState([]);
  const [courseEdges, setCourseEdges] = useState([]);
  const ref = useRef(null);
  let graph = null;
  const loadGraph = () => {
    if (!graph) {
      graph = new G6.Graph({
        // eslint-disable-next-line react/no-find-dom-node
        container: findDOMNode(ref.current),
        width: 1920,
        height: 870,
        modes: {
          default: ["drag-canvas", "drag-node"],
        },
        layout: {
          type: "force",
          preventOverlap: true,
        },
        animate: true,
        defaultNode: {
          size: 60,
        },
      });
    }
    const data = {
      nodes: courses.map((c) => ({ id: c, label: c })),
      edges: courseEdges,
    };
    graph.data(data);
    graph.render();
  };
  useEffect(() => {
    const fetchCourseList = async () => {
      const res = (
        await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}}`)
      ).data;
      const courseList = (
        Object.values(res.structure)
          .flatMap((specialisation) => Object.values(specialisation)
            .filter((spec) => typeof spec === "object" && spec.courses)
            .flatMap((spec) => Object.keys(spec.courses)))
      );
      setCourses(courseList);
      const res2 = await Promise.all(courseList.map((c) => axios.get(`/courses/getPathFrom/${c}`)));
      const children = res2.map((value) => value.data);
      const edges = children.flatMap(
        (courseObject) => courseObject.courses.filter((course) => courseList.includes(course)).map(
          (course) => ({ source: courseObject.original, target: course }),
        ),
      );
      setCourseEdges(edges);
    };
    if (programCode) fetchCourseList();
  }, [programCode, specs]);

  useEffect(() => {
    if (courses.length !== 0 && courseEdges.length !== 0) loadGraph();
  }, [courses, courseEdges]);
  return <div ref={ref} />;
};

export default GraphicalSelector;
