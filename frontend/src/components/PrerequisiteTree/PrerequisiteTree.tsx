/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import G6 from '@antv/g6';
import axios from 'axios';
import prepareUserPayload from 'utils/prepareUserPayload';
import Spinner from 'components/Spinner';
import axiosRequest from 'config/axios';
import { RootState } from 'config/store';
import { addTab } from 'reducers/courseTabsSlice';
import GRAPH_STYLE from './config';
import TREE_CONSTANTS from './constants';
import S from './styles';
import {
  bringEdgeLabelsToFront,
  calcHeight,
  handleNodeData,
  updateEdges,
} from './utils';

type Props = {
  courseCode: string
};

const PrerequisiteTree = ({ courseCode }: Props) => {
  const [loading, setLoading] = useState(true);
  const [graph, setGraph] = useState(null);
  const [courseAccurate, setCourseAccurate] = useState(true);
  const [courseUnlocks, setCourseUnlocks] = useState([]);
  const [coursesRequires, setCoursesRequires] = useState([]);
  const dispatch = useDispatch();
  const ref = useRef(null);
  const { degree, planner } = useSelector((state: RootState) => state);

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

    treeGraphInstance.on('node:click', (event) => {
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
  const getCourseUnlocks = async (code: string) => {
    const [unlockData, unlockErr] = await axiosRequest(
      'get',
      `/courses/courseChildren/${code}`,
    );
    return !unlockErr ? unlockData.courses : [];
  };

  const getCoursePrereqs = async (code: string) => {
    const [prereqData, prereqErr] = await axiosRequest(
      'get',
      `/courses/getPathFrom/${code}`,
    );
    return !prereqErr ? prereqData.courses : [];
  };

  const determineCourseAccuracy = async () => {
    try {
      const res = await axios.post(
        '/courses/getAllUnlocked/',
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
    !courseAccurate ? (
      <p>We could not parse the prerequisite requirements for this course</p>
    ) : (
      <S.PrereqTreeContainer ref={ref} height={calcHeight(coursesRequires, courseUnlocks)}>
        {loading && <Spinner text="Loading tree..." />}
      </S.PrereqTreeContainer>
    )
  );
};

export default PrerequisiteTree;
