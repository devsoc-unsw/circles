import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  ExpandAltOutlined,
  ShrinkOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import type { Graph, GraphOptions, IG6GraphEvent, INode, Item } from '@antv/g6';
import { Switch } from 'antd';
import axios from 'axios';
import { CourseEdge, CoursesAllUnlocked, GraphPayload } from 'types/api';
import { useDebouncedCallback } from 'use-debounce';
import prepareUserPayload from 'utils/prepareUserPayload';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import { useAppWindowSize } from 'hooks';
import { ZOOM_IN_RATIO, ZOOM_OUT_RATIO } from '../constants';
import {
  defaultEdge,
  edgeHoverStyle,
  edgeOpacity,
  edgeUnhoverStyle,
  mapNodeOpacity,
  mapNodeStyle,
  nodeLabelHoverStyle,
  nodeLabelUnhoverStyle,
  nodeStateStyles,
  plannedNode
} from './graph';
import S from './styles';

type Props = {
  onNodeClick: (node: INode) => void;
  handleToggleFullscreen: () => void;
  fullscreen: boolean;
  focused?: string;
};

const CourseGraph = ({ onNodeClick, handleToggleFullscreen, fullscreen, focused }: Props) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const previousTheme = useRef<typeof theme>(theme);
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);
  const { degree, planner } = useSelector((state: RootState) => state);
  const windowSize = useAppWindowSize();

  const graphRef = useRef<Graph | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedCourses, setUnlockedCourses] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // On hover: add styles to adjacent nodes
    const adjacentStyles = async (nodeItem: Item, action: string) => {
      const node = nodeItem as INode;
      const edges = node.getEdges();
      const neighbours = node.getNeighbors();
      const opacity = theme === 'light' ? 0.3 : 0.4;
      const { Arrow } = await import('@antv/g6');
      if (action === 'add') {
        // Every other node and edge becomes less visible
        graphRef.current?.getNodes().forEach((n) => {
          graphRef.current?.updateItem(n as Item, mapNodeOpacity(n.getID(), opacity));
          n.getEdges().forEach((e) => {
            graphRef.current?.updateItem(e, edgeOpacity(e.getID(), opacity));
          });
          n.toBack();
        });
        // Highlight node's edges
        edges.forEach((e) => {
          graphRef.current?.updateItem(e, edgeHoverStyle(Arrow, theme, e.getID()));
          graphRef.current?.updateItem(e, edgeOpacity(e.getID(), 1));
          e.toFront();
        });
        // Target node and neighbouring nodes remain visible
        node.toFront();
        graphRef.current?.updateItem(node as Item, mapNodeOpacity(node.getID(), 1));
        neighbours.forEach((n) => {
          graphRef.current?.updateItem(n as Item, mapNodeOpacity(n.getID(), 1));
          n.toFront();
          console.log(n);
        });
      } else {
        edges.forEach((e) => {
          graphRef.current?.updateItem(e, edgeUnhoverStyle(Arrow, theme, e.getID()));
        });
        graphRef.current?.getNodes().forEach((n) => {
          graphRef.current?.updateItem(n as Item, mapNodeOpacity(n.getID(), 1));
          n.toFront();
        });
        graphRef.current?.getEdges().forEach((e) => {
          graphRef.current?.updateItem(e, edgeOpacity(e.getID(), 1));
        });
      }
      graphRef.current?.paint();
    };

    // On hover: add styles
    const addHoverStyles = (ev: IG6GraphEvent) => {
      const node = ev.item as Item;
      graphRef.current?.setItemState(node, 'hover', true);
      graphRef.current?.updateItem(node, nodeLabelHoverStyle(node.getID()));
      graphRef.current?.paint();
      adjacentStyles(node, 'add');
    };

    // On hover: add styles
    const addUnhoverStyles = (ev: IG6GraphEvent) => {
      const node = ev.item as Item;
      graphRef.current?.clearItemStates(node, 'hover');
      graphRef.current?.updateItem(
        node,
        nodeLabelUnhoverStyle(node.getID(), plannedCourses, theme)
      );
      graphRef.current?.paint();
      adjacentStyles(node, 'remove');
    };

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
        groupByTypes: false,
        defaultNode: plannedNode,
        defaultEdge: defaultEdge(Arrow, theme),
        nodeStateStyles
      };

      graphRef.current = new Graph(graphArgs);

      const data = {
        nodes: courses.map((c) => mapNodeStyle(c, plannedCourses, theme)),
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
        addHoverStyles(ev);
      });

      graphRef.current.on('node:mouseleave', async (ev) => {
        addUnhoverStyles(ev);
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

    // Update styling for: each node, hovering state and edges
    const repaintCanvas = async () => {
      if (graphRef.current) {
        const nodes = graphRef.current.getNodes();
        nodes.map((n) =>
          graphRef.current?.updateItem(n, mapNodeStyle(n.getID(), plannedCourses, theme))
        );

        graphRef.current.on('node:mouseenter', async (ev) => {
          addHoverStyles(ev);
        });
        graphRef.current.on('node:mouseleave', async (ev) => {
          addUnhoverStyles(ev);
        });

        const { Arrow } = await import('@antv/g6');
        const edges = graphRef.current.getEdges();
        edges.map((e) => graphRef.current?.updateItem(e, defaultEdge(Arrow, theme)));
        graphRef.current.paint();
      }
    };

    if (!graphRef.current) setupGraph();
    // Repaint canvas when theme is changed without re-render
    if (previousTheme.current !== theme) {
      previousTheme.current = theme;
      repaintCanvas();
    }
  }, [onNodeClick, plannedCourses, programCode, specs, theme]);

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

  // handle resizing
  const resizeGraph = useCallback(() => {
    const graph = graphRef.current;
    const container = containerRef.current;
    if (!graph || graph.get('destroyed')) return;
    if (!container || !container.scrollWidth || !container.scrollHeight) return;
    graph.changeSize(container.scrollWidth, container.scrollHeight);
  }, []);
  const resizeGraphDebounce = useDebouncedCallback(resizeGraph, 20, { maxWait: 20 });

  useEffect(() => {
    // resize on window size change
    resizeGraphDebounce();
  }, [windowSize, resizeGraphDebounce]);

  useEffect(() => {
    // resize instantly for fullscreening
    resizeGraph();
  }, [fullscreen, resizeGraph]);

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
          <S.Button onClick={handleZoomIn} icon={<ZoomInOutlined />} />
          <S.Button onClick={handleZoomOut} icon={<ZoomOutOutlined />} />
          <S.Button
            onClick={handleToggleFullscreen}
            icon={fullscreen ? <ShrinkOutlined /> : <ExpandAltOutlined />}
          />
        </S.ToolsWrapper>
      )}
    </S.Wrapper>
  );
};

export default CourseGraph;
