import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ExpandAltOutlined,
  ShrinkOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { Graph, INode, Item } from '@antv/g6';
import { Button, Switch, Tabs, Tooltip } from 'antd';
import axios from 'axios';
import { Course, CourseEdge, CoursesAllUnlocked, GraphPayload } from 'types/api';
import prepareUserPayload from 'utils/prepareUserPayload';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import GRAPH_STYLE from './config';
import S from './styles';
import handleNodeData from './utils';

const ZOOM_RATIO = 0.2;
const ZOOM_IN_RATIO = 1 + ZOOM_RATIO;
const ZOOM_OUT_RATIO = 1 - ZOOM_RATIO;

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);
  const { degree, planner } = useSelector((state: RootState) => state);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebar, setSidebar] = useState(true);
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
      const { Graph, Arrow } = await import('@antv/g6');
      const { breadthFirstSearch } = await import('@antv/algorithm');
      const graphInstance = new Graph({
        container,
        width: container.scrollWidth,
        height: container.scrollHeight,
        linkCenter: true,
        modes: {
          default: ['drag-canvas', 'zoom-canvas']
        },
        layout: {
          type: 'comboCombined',
          preventOverlap: true,
          nodeSpacing: 10,
          linkDistance: 500
        },
        animate: true, // Boolean, whether to activate the animation when global changes happen
        animateCfg: {
          duration: 500, // Number, the duration of one animation
          easing: 'easeQuadInOut' // String, the easing function
        },
        defaultNode: GRAPH_STYLE.defaultNode,
        defaultEdge: GRAPH_STYLE.defaultEdge(Arrow),
        nodeStateStyles: GRAPH_STYLE.nodeStateStyles
      });

      setGraph(graphInstance);

      const data = {
        nodes: courses.map((c) => handleNodeData(c, plannedCourses)),
        edges: courseEdges
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
            }
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
            }
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
        const res = await axios.get<GraphPayload>(
          `/programs/graph/${programCode}/${specs.join('+')}`
        );
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

  const showAllCourses = () => {
    if (graph) {
      const nodes = graph.getNodes();
      const edges = graph.getEdges();
      nodes.forEach((n) => n.show());
      edges.forEach((e) => e.show());
    }
  };

  const showUnlockedCourses = async () => {
    if (!graph) return;
    try {
      const res = await axios.post<CoursesAllUnlocked>(
        '/courses/getAllUnlocked/',
        JSON.stringify(prepareUserPayload(degree, planner))
      );
      const coursesStates = res.data.courses_state;
      const nodes = graph.getNodes();
      nodes.forEach((n) => {
        const id = n.getID();
        if (coursesStates[id] && coursesStates[id].unlocked) {
          n.show();
        } else {
          n.getEdges().forEach((e) => e.hide());
          n.hide();
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at showUnlockedCourses', e);
    }
  };

  const handleShowCourses = async () => {
    if (showUnlockedOnly) {
      showUnlockedCourses();
    } else {
      showAllCourses();
    }
    setShowUnlockedOnly((prevState) => !prevState);
  };

  const handleFocusCourse = (courseCode: string) => {
    if (graph?.findById(courseCode)) {
      graph.focusItem(courseCode);
      updateCourse(courseCode);
    }
  };

  const handleZoomIn = () => {
    const viewportCenter = graph?.getViewPortCenterPoint() ?? undefined;
    graph?.zoom(ZOOM_IN_RATIO, viewportCenter, true, { easing: 'easeQuadIn', duration: 200 });
  };

  const handleZoomOut = () => {
    const viewportCenter = graph?.getViewPortCenterPoint() ?? undefined;
    graph?.zoom(ZOOM_OUT_RATIO, viewportCenter, true, { easing: 'easeQuadOut', duration: 200 });
  };

  const handleToggleSidebar = () => {
    setSidebar((prevState) => !prevState);
  };

  useEffect(() => {
    // resize canvas size when sidebar state changes
    graph?.changeSize(ref.current?.scrollWidth ?? 0, ref.current?.scrollHeight ?? 0);
  }, [graph, sidebar]);

  const items = [
    { label: 'Course Info', key: 'course-info', children: 'Content 1' },
    { label: 'Program Structure', key: 'program-structure', children: 'Content 2' },
    { label: 'Help', key: 'help', children: 'Content 3' }
  ];

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.GraphPlaygroundWrapper ref={ref}>
          {loading ? (
            <Spinner text="Loading graph..." />
          ) : (
            <>
              <S.SearchBarWrapper>
                <CourseSearchBar onSelectCallback={handleFocusCourse} style={{ width: '25rem' }} />
              </S.SearchBarWrapper>
              <S.ToolsWrapper>
                Show All Courses
                <Tooltip
                  placement="bottomLeft"
                  title={showUnlockedOnly ? 'Hide locked courses' : 'Show locked courses'}
                >
                  <Switch defaultChecked={showUnlockedOnly} onChange={handleShowCourses} />
                </Tooltip>
                <Button onClick={handleZoomIn} icon={<ZoomInOutlined />} />
                <Button onClick={handleZoomOut} icon={<ZoomOutOutlined />} />
                <Button
                  onClick={handleToggleSidebar}
                  icon={sidebar ? <ExpandAltOutlined /> : <ShrinkOutlined />}
                />
              </S.ToolsWrapper>
            </>
          )}
        </S.GraphPlaygroundWrapper>
        {sidebar && (
          <S.SidebarWrapper>
            <Tabs items={items} />
            {course ? (
              <div>
                {course.code} - {course.title}
              </div>
            ) : (
              'No course selected'
            )}
          </S.SidebarWrapper>
        )}
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
