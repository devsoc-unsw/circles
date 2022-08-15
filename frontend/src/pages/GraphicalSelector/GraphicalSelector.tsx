import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import LockOutlined from '@ant-design/icons/LockOutlined';
import UnlockOutlined from '@ant-design/icons/UnlockOutlined';
import { breadthFirstSearch } from '@antv/algorithm';
import type { INode, Item } from '@antv/g6-core';
import type { Graph } from '@antv/g6-pc';
import Button from 'antd/lib/button';
import Switch from 'antd/lib/switch';
import Tooltip from 'antd/lib/tooltip';
import axios from 'axios';
import {
  Course, CourseEdge, CoursesAllUnlocked, GraphPayload,
} from 'types/api';
import prepareUserPayload from 'utils/prepareUserPayload';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import GRAPH_STYLE from './config';
import S from './styles';
import handleNodeData from './utils';

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);
  const { degree, planner } = useSelector((state: RootState) => state);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(true);

  const ref = useRef<HTMLDivElement | null>(null);

  const updateCourse = async (courseCode: string) => {
    try {
      const res = await axios.get<Course>(`/courses/getCourse/${courseCode}`);
      setCourse(res.data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at updateCourse', e);
    }
  };

  useEffect(() => {
    // courses is a list of course codes
    const initialiseGraph = async (courses: string[], courseEdges: CourseEdge[]) => {
      const container = ref.current;
      if (!container) return;
      const Graph = (await import('@antv/g6-pc/lib/graph/graph')).default;
      const graphInstance: Graph = new Graph({
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
        const id = node.getID();
        updateCourse(id);

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
        console.error('Error at setupGraph', e);
      }
      setLoading(false);
    };

    if (!graph) setupGraph();
  }, [graph, plannedCourses, programCode, specs]);

  const handleShowAllCoursesGraph = () => {
    if (graph) {
      const nodes = graph.getNodes();
      const edges = graph.getEdges();
      nodes.forEach((n) => n.show());
      edges.forEach((e) => e.show());
    }
  };

  const handleShowUnlockedCoursesGraph = async () => {
    if (!graph) return;
    try {
      const res = await axios.post<CoursesAllUnlocked>(
        '/courses/getAllUnlocked/',
        JSON.stringify(prepareUserPayload(degree, planner)),
      );
      const coursesStates = res.data.courses_state;
      const nodes = graph.getNodes();
      nodes.forEach(
        (n) => {
          const id = n.getID();
          if (coursesStates[id] && coursesStates[id].unlocked) {
            n.show();
          } else {
            n.getEdges().forEach((e) => e.hide());
            n.hide();
          }
        },
      );
    } catch (e) {
      // eslint-disable-next-line
      console.error('Error at handleShowUnlockedCoursesGraph', e);
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

  const toggleShowLockedCourses = async () => {
    if (showUnlockedOnly) {
      handleShowUnlockedCoursesGraph();
    } else {
      handleShowAllCoursesGraph();
    }
    setShowUnlockedOnly((prevState) => !prevState);
  };

  const focusCourse = (courseCode: string) => {
    if (graph) {
      if (graph.findById(courseCode)) {
        graph.focusItem(courseCode, true, { easing: 'easeQuadInOut', duration: 500 });
        updateCourse(courseCode);
      }
    }
  };

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.GraphPlaygroundWrapper ref={ref}>
          {loading
            ? <Spinner text="Loading graph..." />
            : (
              <S.SearchBarWrapper>
                <CourseSearchBar onSelectCallback={focusCourse} style={{ width: '25rem' }} />
              </S.SearchBarWrapper>
            )}
        </S.GraphPlaygroundWrapper>
        <S.SidebarWrapper>
          <Tooltip placement="topLeft" title={showUnlockedOnly ? 'Hide locked courses' : 'Show locked courses'}>
            <Switch
              defaultChecked={showUnlockedOnly}
              style={{ alignSelf: 'flex-end' }}
              onChange={toggleShowLockedCourses}
              checkedChildren={<LockOutlined />}
              unCheckedChildren={<UnlockOutlined />}
            />
          </Tooltip>
          <Button onClick={handleShowAllCoursesGraph}>
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
