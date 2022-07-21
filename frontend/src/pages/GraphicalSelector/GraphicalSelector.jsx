import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import G6 from "@antv/g6";
import { Button } from "antd";
import axios from "axios";
import PageTemplate from "components/PageTemplate";
import Spinner from "components/Spinner";
import axiosRequest from "config/axios";
import GRAPH_STYLE from "./config";
import NodeSearchBar from "./NodeSearchBar";
import S from "./styles";
import handleNodeData from "./utils";

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state) => state.degree);
  const { courses: plannedCourses } = useSelector((state) => state.planner);

  const [graph, setGraph] = useState(null);
  const [coursesDetails, setCoursesDetails] = useState(null);
  const [course, setCourse] = useState(null);

  const ref = useRef(null);

  const displayCourseDetails = async (code) => {
    const [courseData, err] = await axiosRequest("get", `/courses/getCourse/${code}`);
    if (!err) setCourse(courseData);
  };

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
      await displayCourseDetails(id);
    });
  };

  const setupGraph = async () => {
    const { structure } = (
      await axios.get(`/programs/getStructure/${programCode}/${specs.join("+")}`)
    ).data;

    const coursesList = (
      Object.values(structure)
        .flatMap((specialisation) => Object.values(specialisation)
          .filter((spec) => typeof spec === "object" && spec.courses && !(spec.type.includes("rule") || spec.type.includes("gened")))
          .flatMap((spec) => Object.entries(spec.courses)))
        .filter((v, i, a) => a.indexOf(v) === i) // TODO: hack to make courseList unique
    );

    const courseKeysList = coursesList.map((c) => (c[0]));
    const res = await Promise.all(courseKeysList.map((c) => axios.get(`/courses/getPathFrom/${c}`).catch((e) => e)));
    // filter any errors from res
    const children = res.filter((value) => value?.data?.courses).map((value) => value.data);
    const edges = children
      .flatMap((courseObject) => courseObject.courses
        .filter((c) => courseKeysList.includes(c))
        .map((c) => ({ source: courseObject.original, target: c })));
    if (courseKeysList.length !== 0 && edges.length !== 0) initialiseGraph(courseKeysList, edges);
    setCoursesDetails(coursesList);
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

  const focusCourse = (id) => {
    if (graph) {
      graph.focusItem(id, true, { easing: "easeQuadInOut", duration: 500 });
      displayCourseDetails(id);
    }
  };

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.GraphPlaygroundWrapper ref={ref}>
          {(!coursesDetails) && <Spinner text="Loading graph..." />}
          <S.SearchBarWrapper>
            {(coursesDetails) && <NodeSearchBar courses={coursesDetails} onSelect={focusCourse} />}
          </S.SearchBarWrapper>
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
