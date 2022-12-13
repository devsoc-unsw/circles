import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ExpandAltOutlined,
  ShrinkOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { Graph, GraphOptions, INode, Item } from '@antv/g6';
import { Button, Switch } from 'antd';
import axios from 'axios';
import { CourseEdge, CoursesAllUnlocked, GraphPayload } from 'types/api';
import prepareUserPayload from 'utils/prepareUserPayload';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import { ZOOM_IN_RATIO, ZOOM_OUT_RATIO } from '../constants';
import { defaultEdge, defaultNode, mapNodeStyle, nodeStateStyles } from '../graph';
import S from './styles';

type Props = {
  onNodeClick: (node: INode) => void;
  handleToggleFullscreen: () => void;
  fullscreen: boolean;
  focused?: string;
};

const CourseGraph = ({ onNodeClick, handleToggleFullscreen, fullscreen, focused }: Props) => {
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);
  const { degree, planner } = useSelector((state: RootState) => state);

  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedCourses, setUnlockedCourses] = useState(false);

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
        onNodeClick(ev.item as INode);
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
  }, [onNodeClick, plannedCourses, programCode, specs]);

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

  // focus the focussed course
  useEffect(() => {
    if (focused) {
      graphRef.current?.focusItem(focused);
    }
  }, [focused]);

  useEffect(() => {
    // resize canvas size when sidebar state changes
    graphRef.current?.changeSize(
      containerRef.current?.scrollWidth ?? 0,
      containerRef.current?.scrollHeight ?? 0
    );
    // }, [sidebar]);
  }, [fullscreen]);

  useEffect(() => {
    if (unlockedCourses) showUnlockedCourses();
    else showAllCourses();
  }, [planner.courses, showUnlockedCourses, unlockedCourses]);

  return (
    <S.Wrapper ref={containerRef}>
      {loading ? (
        <S.SpinnerWrapper>
          <Spinner text="Loading graph..." />
        </S.SpinnerWrapper>
      ) : (
        <S.ToolsWrapper>
          Show All Courses
          <Switch
            checked={!unlockedCourses}
            onChange={() => setUnlockedCourses((prevState) => !prevState)}
          />
          <Button onClick={handleZoomIn} icon={<ZoomInOutlined />} />
          <Button onClick={handleZoomOut} icon={<ZoomOutOutlined />} />
          <Button
            onClick={handleToggleFullscreen}
            icon={fullscreen ? <ShrinkOutlined /> : <ExpandAltOutlined />}
          />
        </S.ToolsWrapper>
      )}
    </S.Wrapper>
  );
};

export default CourseGraph;
