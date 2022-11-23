import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ExpandAltOutlined,
  ShrinkOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { Graph, GraphOptions, INode, Item } from '@antv/g6';
import { Button, Switch, Tabs } from 'antd';
import axios from 'axios';
import { CourseEdge, CoursesAllUnlocked, GraphPayload } from 'types/api';
import prepareUserPayload from 'utils/prepareUserPayload';
import CourseSearchBar from 'components/CourseSearchBar';
import PageTemplate from 'components/PageTemplate';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import {
  COURSE_INFO_TAB,
  HELP_TAB,
  PROGRAM_STRUCTURE_TAB,
  ZOOM_IN_RATIO,
  ZOOM_OUT_RATIO
} from './constants';
import { defaultEdge, defaultNode, mapNodeStyle, nodeStateStyles } from './graph';
import HowToUse from './HowToUse';
import S from './styles';

const GraphicalSelector = () => {
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);
  const { degree, planner } = useSelector((state: RootState) => state);

  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebar, setSidebar] = useState(true);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [unlockedCourses, setUnlockedCourses] = useState(false);
  const [activeTab, setActiveTab] = useState(HELP_TAB);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // courses is a list of course codes
    const initialiseGraph = async (courses: string[], courseEdges: CourseEdge[]) => {
      const container = containerRef.current;
      if (!container) return;

      const { Graph, Arrow } = await import('@antv/g6');

      const graphArgs: GraphOptions = {
        container,
        width: container.scrollWidth,
        height: container.scrollHeight,
        linkCenter: true,
        modes: {
          default: ['drag-canvas', 'zoom-canvas']
        },
        layout: {
          type: 'gForce',
          linkDistance: 500,
          nodeStrength: 2500,
          preventOverlap: true,
          onLayoutEnd: () => {
            setLoading(false);
          }
        },
        animate: true, // Boolean, whether to activate the animation when global changes happen
        animateCfg: {
          duration: 500, // Number, the duration of one animation
          easing: 'easeQuadInOut' // String, the easing function
        },
        defaultNode,
        defaultEdge: defaultEdge(Arrow),
        nodeStateStyles
      };

      graphRef.current = new Graph(graphArgs);

      const data = {
        nodes: courses.map((c) => mapNodeStyle(c, plannedCourses)),
        edges: courseEdges
      };

      graphRef.current.data(data);
      graphRef.current.render();

      graphRef.current.on('node:click', async (ev) => {
        // Clicking a node loads up course description for the course and set active
        // tab to course info
        const node = ev.item as INode;
        const id = node.getID();
        setCourseCode(id);
        setActiveTab('course-info');

        // TODO: may need to remove this?
        // const { breadthFirstSearch } = await import('@antv/algorithm');

        // // hides/ unhides dependent nodes
        // if (node.hasState('click')) {
        //   graphRef.current.clearItemStates(node, 'click');
        //   breadthFirstSearch(data, id, {
        //     enter: ({ current }: { current: string }) => {
        //       if (id !== current) {
        //         const currentNode = graphRef.current.findById(current) as INode;
        //         // Unhiding node won't unhide other hidden nodes
        //         currentNode.getEdges().forEach((e) => e.show());
        //         currentNode.show();
        //       }
        //     }
        //   });
        // } else if (node.getOutEdges().length) {
        //   graphRef.current.setItemState(node, 'click', true);
        //   breadthFirstSearch(data, id, {
        //     enter: ({ current }: { current: string }) => {
        //       if (id !== current) {
        //         const currentNode = graphRef.current.findById(current) as INode;
        //         currentNode.getEdges().forEach((e) => e.hide());
        //         currentNode.hide();
        //       }
        //     }
        //   });
        // }
      });

      graphRef.current.on('node:mouseenter', async (ev) => {
        const node = ev.item as Item;
        graphRef.current?.setItemState(node, 'hover', true);
      });

      graphRef.current.on('node:mouseleave', async (ev) => {
        const node = ev.item as Item;
        graphRef.current?.clearItemStates(node, 'hover');
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
    };

    if (!graphRef.current) setupGraph();
  }, [plannedCourses, programCode, specs]);

  const showAllCourses = () => {
    if (!graphRef.current) return;
    graphRef.current.getNodes().forEach((n) => n.show());
    graphRef.current.getEdges().forEach((e) => e.show());
  };

  const showUnlockedCourses = useCallback(async () => {
    if (!graphRef.current) return;
    try {
      const {
        data: { courses_state: coursesStates }
      } = await axios.post<CoursesAllUnlocked>(
        '/courses/getAllUnlocked/',
        JSON.stringify(prepareUserPayload(degree, planner))
      );
      graphRef.current.getNodes().forEach((n) => {
        const id = n.getID();
        if (coursesStates[id]?.unlocked) {
          n.show();
          n.getOutEdges().forEach((e) => {
            if (coursesStates[e.getTarget().getID()]?.unlocked) e.show();
          });
        } else {
          n.hide();
          n.getEdges().forEach((e) => e.hide());
        }
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error at showUnlockedCourses', e);
    }
  }, [degree, planner]);

  const handleFocusCourse = (code: string) => {
    graphRef.current?.focusItem(code);
    setCourseCode(code);
  };

  const handleZoomIn = () => {
    const viewportCenter = graphRef.current?.getViewPortCenterPoint();
    graphRef.current?.zoom(ZOOM_IN_RATIO, viewportCenter, true, {
      easing: 'easeQuadIn',
      duration: 200
    });
  };

  const handleZoomOut = () => {
    const viewportCenter = graphRef.current?.getViewPortCenterPoint();
    graphRef.current?.zoom(ZOOM_OUT_RATIO, viewportCenter, true, {
      easing: 'easeQuadOut',
      duration: 200
    });
  };

  const handleToggleSidebar = () => {
    setSidebar((prevState) => !prevState);
  };

  useEffect(() => {
    // resize canvas size when sidebar state changes
    graphRef.current?.changeSize(
      containerRef.current?.scrollWidth ?? 0,
      containerRef.current?.scrollHeight ?? 0
    );
  }, [sidebar]);

  useEffect(() => {
    if (unlockedCourses) showUnlockedCourses();
    else showAllCourses();
  }, [planner.courses, showUnlockedCourses, unlockedCourses]);

  const items = [
    {
      label: 'Course Info',
      key: COURSE_INFO_TAB,
      children: courseCode ? (
        <S.CourseDescriptionPanel
          courseCode={courseCode}
          key={courseCode}
          onCourseClick={(code) => handleFocusCourse(code)}
        />
      ) : (
        'No course selected'
      )
    },
    { label: 'Program Structure', key: PROGRAM_STRUCTURE_TAB, children: 'Program Structure' },
    { label: 'Help', key: HELP_TAB, children: <HowToUse /> }
  ];

  return (
    <PageTemplate>
      <S.Wrapper>
        <S.GraphPlaygroundWrapper ref={containerRef}>
          {loading ? (
            <S.SpinnerWraper>
              <Spinner text="Loading graph..." />
            </S.SpinnerWraper>
          ) : (
            <>
              <S.SearchBarWrapper>
                <CourseSearchBar onSelectCallback={handleFocusCourse} style={{ width: '25rem' }} />
              </S.SearchBarWrapper>
              <S.ToolsWrapper>
                Show All Courses
                <Switch
                  checked={!unlockedCourses}
                  onChange={() => setUnlockedCourses((prevState) => !prevState)}
                />
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
            <Tabs
              items={items}
              activeKey={activeTab}
              onChange={(activeKey) => setActiveTab(activeKey)}
            />
          </S.SidebarWrapper>
        )}
      </S.Wrapper>
    </PageTemplate>
  );
};

export default GraphicalSelector;
