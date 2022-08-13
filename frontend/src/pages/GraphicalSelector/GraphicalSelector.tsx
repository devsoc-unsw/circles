import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { breadthFirstSearch } from '@antv/algorithm';
import type { Graph, INode, Item } from '@antv/g6';
import G6 from '@antv/g6';
import { Button } from 'antd';
import axios from 'axios';
import { CourseEdge, GraphPayload } from 'types/api';
import { CourseDetail } from 'types/courses';
import PageTemplate from 'components/PageTemplate';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import GRAPH_STYLE from './config';
import S from './styles';
import handleNodeData from './utils';

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetail | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // courses is a list of course codes
    const initialiseGraph = (courses: string[], courseEdges: CourseEdge[]) => {
      const container = ref.current;
      if (!container) return;

      const graphInstance = new G6.Graph({
        container,
        width: container.scrollWidth,
        height: container.scrollHeight,
        linkCenter: true,
        modes: {
          default: [
            'drag-canvas',
            'zoom-canvas',
          // "drag-node",
          ],
        },
        layout: {
          type: 'comboCombined',
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

      graphInstance.on('node:click', async (ev) => {
      // load up course information
        const node = ev.item as INode;
        if (!node || !node['_cfg']?.id) return;
        const { _cfg: { id } } = node;
        const res = await axios.get<CourseDetail>(`/courses/getCourse/${id}`);
        if (res.status === 200) setCourse(res.data);

        // hides/ unhides dependent nodes
        if (node.hasState('click')) {
          graphInstance.clearItemStates(node, 'click');
          breadthFirstSearch(data, id, {
            enter: ({ current }: { current: string }) => {
              if (id !== current) {
                const currentNode = graphInstance.findById(current) as INode;
                // Unhiding node won't unhide other hidden nodes
                currentNode.getEdges().forEach((e) => e.show());
                currentNode.show();
              }
            },
          });
        } else if (node.getOutEdges().length) {
          graphInstance.setItemState(node, 'click', true);
          breadthFirstSearch(data, id, {
            enter: ({ current }: { current: string }) => {
              if (id !== current) {
                const currentNode = graphInstance.findById(current) as INode;
                currentNode.getEdges().forEach((e) => e.hide());
                currentNode.hide();
              }
            },
          });
        }
      });

      graphInstance.on('node:mouseenter', async (ev) => {
        const node = ev.item as Item;
        graphInstance.setItemState(node, 'hover', true);
      });

      graphInstance.on('node:mouseleave', async (ev) => {
        const node = ev.item as Item;
        graphInstance.clearItemStates(node, 'hover');
      });
    };

    const setupGraph = async () => {
      try {
        const res = await axios.get<GraphPayload>(`/programs/graph/${programCode}/${specs.join('+')}`);
        const { edges, courses } = res.data;
        if (courses.length !== 0 && edges.length !== 0) initialiseGraph(courses, edges);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error at setupGraph', e);
      }
      setLoading(false);
    };

    if (programCode) setupGraph();
  }, [plannedCourses, programCode, specs]);

  const handleShowGraph = () => {
    if (graph) {
      const nodes = graph.getNodes();
      const edges = graph.getEdges();
      nodes.forEach((n) => n.show());
      edges.forEach((e) => e.show());
    }
  };

  const handleHideGraph = () => {
    if (graph) {
      const nodes = graph.getNodes();
      const edges = graph.getEdges();
      nodes.forEach((n) => n.hide());
      edges.forEach((e) => e.hide());
    }
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
            {course ? <div>{course.code} - {course.title}</div> : 'No course selected'}
          </div>
        </S.SidebarWrapper>
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
