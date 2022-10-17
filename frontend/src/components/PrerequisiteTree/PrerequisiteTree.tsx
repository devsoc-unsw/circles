import React, { useEffect, useRef, useState } from 'react';
import type { Item, TreeGraph, TreeGraphData } from '@antv/g6';
import axios from 'axios';
import { CourseChildren, CoursePathFrom } from 'types/api';
import { CourseList } from 'types/courses';
import Spinner from 'components/Spinner';
import GRAPH_STYLE from './config';
import TREE_CONSTANTS from './constants';
import S from './styles';
import { bringEdgeLabelsToFront, calcHeight, handleNodeData, updateEdges } from './utils';

type Props = {
  courseCode: string;
  onCourseClick?: (code: string) => void;
};

const PrerequisiteTree = ({ courseCode, onCourseClick }: Props) => {
  const [loading, setLoading] = useState(true);
  const graphRef = useRef<TreeGraph | null>(null);
  const [courseUnlocks, setCourseUnlocks] = useState<CourseList>([]);
  const [coursesRequires, setCoursesRequires] = useState<CourseList>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // if the course code changes, force a reload
    setLoading(true);
  }, [courseCode]);

  useEffect(() => {
    /* GRAPH IMPLEMENTATION */
    const generateTreeGraph = async (graphData: TreeGraphData) => {
      const container = ref.current;
      if (!container) return;
      const { TreeGraph } = await import('@antv/g6');

      graphRef.current = new TreeGraph({
        container,
        width: container.scrollWidth,
        height: container.scrollHeight,
        fitView: true,
        layout: GRAPH_STYLE.graphLayout,
        defaultNode: GRAPH_STYLE.defaultNode,
        defaultEdge: GRAPH_STYLE.defaultEdge
      });

      graphRef.current.data(graphData);

      updateEdges(graphRef.current, graphData);

      graphRef.current.render();

      bringEdgeLabelsToFront(graphRef.current);

      graphRef.current.on('node:click', (event) => {
        // open new course tab
        const node = event.item as Item;
        if (onCourseClick) onCourseClick(node.getModel().label as string);
      });
    };

    // NOTE: This is for hot reloading in development as new graph will instantiate every time
    const updateTreeGraph = (graphData: TreeGraphData) => {
      if (!graphRef.current) return;
      graphRef.current.changeData(graphData);
      bringEdgeLabelsToFront(graphRef.current);
    };

    /* REQUESTS */
    const getCourseUnlocks = async (code: string) => {
      try {
        const res = await axios.get<CourseChildren>(`/courses/courseChildren/${code}`);
        return res.data.courses;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCourseUnlocks', e);
        return [];
      }
    };

    const getCoursePrereqs = async (code: string) => {
      try {
        const res = await axios.get<CoursePathFrom>(`/courses/getPathFrom/${code}`);
        return res.data.courses;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at getCoursePrereqs', e);
        return [];
      }
    };

    /* MAIN */
    const setupGraph = async (c: string) => {
      setLoading(true);

      const unlocks = await getCourseUnlocks(c);
      if (unlocks) setCourseUnlocks(unlocks);
      const prereqs = await getCoursePrereqs(c);
      if (prereqs) setCoursesRequires(prereqs);

      // create graph data
      const graphData = {
        id: 'root',
        label: courseCode,
        children: prereqs
          ?.map((child) => handleNodeData(child, TREE_CONSTANTS.PREREQ))
          .concat(unlocks?.map((child) => handleNodeData(child, TREE_CONSTANTS.UNLOCKS)))
      };

      // render graph
      if (!graphRef.current && graphData.children.length !== 0) {
        generateTreeGraph(graphData);
      } else {
        // NOTE: This is for hot reloading in development as new graph will instantiate every time
        updateTreeGraph(graphData);
      }
      setLoading(false);
    };

    if (loading) {
      setupGraph(courseCode);
      setLoading(false);
    }
  }, [courseCode, loading, onCourseClick]);

  return (
    <S.PrereqTreeContainer ref={ref} height={calcHeight(coursesRequires, courseUnlocks)}>
      {loading && <Spinner text="Loading tree..." />}
      {!loading && graphRef.current && !graphRef.current.getEdges().length && (
        <p> No prerequisite visualisation is needed for this course </p>
      )}
    </S.PrereqTreeContainer>
  );
};

export default PrerequisiteTree;
