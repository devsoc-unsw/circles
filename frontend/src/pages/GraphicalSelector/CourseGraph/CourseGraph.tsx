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
  edgeInHoverStyle,
  edgeOutHoverStyle,
  edgeUnhoverStyle,
  mapEdgeOpacity,
  mapNodeOpacity,
  mapNodePrereq,
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
  hasPlannerUpdated: React.MutableRefObject<boolean>;
};

interface CoursePrerequisite {
  [key: string]: string[];
}

const CourseGraph = ({
  onNodeClick,
  handleToggleFullscreen,
  fullscreen,
  focused,
  hasPlannerUpdated
}: Props) => {
  const { theme } = useSelector((state: RootState) => state.settings);
  const previousTheme = useRef<typeof theme>(theme);
  const { programCode, specs } = useSelector((state: RootState) => state.degree);
  const { courses: plannedCourses } = useSelector((state: RootState) => state.planner);
  const { degree, planner, courses } = useSelector((state: RootState) => state);
  const windowSize = useAppWindowSize();

  const graphRef = useRef<Graph | null>(null);
  const initialising = useRef(false); // prevents multiple graphs being loaded
  const [loading, setLoading] = useState(true);
  const [unlockedCourses, setUnlockedCourses] = useState(false);
  const [prerequisites, setPrerequisites] = useState<CoursePrerequisite>({});

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isCoursePrerequisite = (target: string, neighbour: string) => {
      const prereqs = prerequisites[target] || [];
      return prereqs.includes(neighbour);
    };

    const addNeighbourStyles = async (nodeItem: Item) => {
      const node = nodeItem as INode;
      const neighbours = node.getNeighbors();
      const opacity = theme === 'light' ? 0.3 : 0.4;
      const { Arrow } = await import('@antv/g6');

      // Every other node and edge becomes less visible
      graphRef.current?.getNodes().forEach((n) => {
        graphRef.current?.updateItem(n as Item, mapNodeOpacity(n.getID(), opacity));
        n.getEdges().forEach((e) => {
          graphRef.current?.updateItem(e, mapEdgeOpacity(Arrow, theme, e.getID(), opacity));
        });
        n.toBack();
      });
      // Highlight node's edges
      node.getOutEdges().forEach((e) => {
        graphRef.current?.updateItem(e, edgeOutHoverStyle(Arrow, theme, e.getID()));
        e.toFront();
      });
      node.getInEdges().forEach((e) => {
        graphRef.current?.updateItem(e, edgeInHoverStyle(Arrow, theme, e.getID()));
        e.toFront();
      });
      // Target node and neighbouring nodes remain visible
      node.toFront();
      graphRef.current?.updateItem(node as Item, mapNodeOpacity(node.getID(), 1));
      neighbours.forEach((n) => {
        graphRef.current?.updateItem(n as Item, mapNodeOpacity(n.getID(), 1));
        n.toFront();
        const courseId = n.getID();
        if (isCoursePrerequisite(node.getID(), courseId)) {
          graphRef.current?.updateItem(n as Item, mapNodePrereq(courseId, theme));
        }
      });
    };

    const removeNeighbourStyles = async (nodeItem: Item) => {
      const node = nodeItem as INode;
      const edges = node.getEdges();
      const { Arrow } = await import('@antv/g6');

      edges.forEach((e) => {
        graphRef.current?.updateItem(e, edgeUnhoverStyle(Arrow, theme, e.getID()));
      });
      graphRef.current?.getNodes().forEach((n) => {
        const courseId = n.getID();
        graphRef.current?.updateItem(
          n as Item,
          mapNodeStyle(courseId, plannedCourses, courses.courses, theme)
        );
        graphRef.current?.updateItem(n as Item, mapNodeOpacity(courseId, 1));
        n.toFront();
      });
      graphRef.current?.getEdges().forEach((e) => {
        graphRef.current?.updateItem(e, mapEdgeOpacity(Arrow, theme, e.getID(), 1));
      });
    };

    // On hover: add styles
    const addHoverStyles = (ev: IG6GraphEvent) => {
      const node = ev.item as Item;
      graphRef.current?.setItemState(node, 'hover', true);
      graphRef.current?.updateItem(node, nodeLabelHoverStyle(node.getID()));
      addNeighbourStyles(node);
      graphRef.current?.paint();
    };

    // On hover: remove styles
    const addUnhoverStyles = (ev: IG6GraphEvent) => {
      const node = ev.item as Item;
      graphRef.current?.clearItemStates(node, 'hover');
      graphRef.current?.updateItem(
        node,
        nodeLabelUnhoverStyle(node.getID(), plannedCourses, theme)
      );
      removeNeighbourStyles(node);
      graphRef.current?.paint();
    };

    const initialiseGraph = async (courseCodes: string[], courseEdges: CourseEdge[]) => {
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
        nodes: courseCodes.map((c) => mapNodeStyle(c, plannedCourses, courses.courses, theme)),
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

    // Store a hashmap for performance reasons when highlighting nodes
    const makePrerequisitesMap = (edges: CourseEdge[]) => {
      const prereqs: CoursePrerequisite = prerequisites;
      edges.forEach((e) => {
        if (!prereqs[e.target]) {
          prereqs[e.target] = [e.source];
        } else {
          prereqs[e.target].push(e.source);
        }
      });
      setPrerequisites(prereqs);
    };

    // Without re-render, update styling for: each node, hovering state and edges
    const repaintCanvas = async () => {
      const nodes = graphRef.current?.getNodes();
      nodes?.map((n) =>
        graphRef.current?.updateItem(
          n,
          mapNodeStyle(n.getID(), plannedCourses, courses.courses, theme)
        )
      );

      graphRef.current?.off('node:mouseenter');
      graphRef.current?.off('node:mouseleave');
      graphRef.current?.on('node:mouseenter', async (ev) => {
        addHoverStyles(ev);
      });
      graphRef.current?.on('node:mouseleave', async (ev) => {
        addUnhoverStyles(ev);
      });

      const { Arrow } = await import('@antv/g6');
      const edges = graphRef.current?.getEdges();
      edges?.map((e) => graphRef.current?.updateItem(e, defaultEdge(Arrow, theme)));
      graphRef.current?.paint();
    };

    const setupGraph = async () => {
      try {
        initialising.current = true;
        const res = await axios.get<GraphPayload>(
          `/programs/graph/${programCode}/${specs.join('+')}`
        );
        const { edges } = res.data;
        makePrerequisitesMap(edges);
        if (res.data.courses.length !== 0 && edges.length !== 0) {
          initialiseGraph(res.data.courses, edges);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error at setupGraph', e);
      }
    };

    if (!initialising.current) setupGraph();
    if (hasPlannerUpdated.current) {
      hasPlannerUpdated.current = false;
      repaintCanvas();
    }
    // Change theme without re-render
    if (previousTheme.current !== theme) {
      previousTheme.current = theme;
      repaintCanvas();
    }
  }, [
    onNodeClick,
    plannedCourses,
    programCode,
    specs,
    theme,
    prerequisites,
    courses,
    hasPlannerUpdated
  ]);

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
