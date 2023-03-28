import type { Arrow } from '@antv/g6';
import { PlannerCourse } from 'types/planner';

const plannedNode = {
  size: 70,
  style: {
    fill: '#9254de',
    stroke: '#9254de',
    cursor: 'pointer'
  },
  labelCfg: {
    style: {
      fill: '#fff',
      fontFamily: 'Arial',
      cursor: 'pointer'
    }
  }
};

const lockedNode = (theme: string) => ({
  style: {
    fill: theme === 'light' ? '#fff' : '#000',
    stroke: theme === 'light' ? '#9254de' : '#d7b7fd'
  },
  labelCfg: {
    style: {
      fill: theme === 'light' ? '#9254de' : '#d7b7fd'
    }
  }
});

const sameNode = (courseCode: string) => ({
  id: courseCode,
  label: courseCode
});

const nodeStateStyles = {
  hover: {
    fill: '#b37feb',
    stroke: '#b37feb'
  },
  click: {
    fill: '#b37feb',
    stroke: '#b37feb'
  }
};

const defaultEdge = (arrow: typeof Arrow, theme: string) => ({
  style: {
    endArrow: {
      path: arrow.triangle(5, 5, 30),
      fill: theme === 'light' ? '#e0e0e0' : '#4a4a4a',
      d: 25
    },
    stroke: theme === 'light' ? '#e0e0e0' : '#4a4a4a'
  }
});

const edgeHoverStyle = (arrow: typeof Arrow, theme: string, id: string) => ({
  id,
  style: {
    endArrow: {
      path: arrow.triangle(5, 5, 30),
      fill: theme === 'light' ? '#999' : '#aaa',
      d: 25
    },
    stroke: theme === 'light' ? '#999' : '#aaa'
  }
});

const edgeUnhoverStyle = (arrow: typeof Arrow, theme: string, id: string) => {
  return {
    id,
    ...defaultEdge(arrow, theme)
  };
};

const mapNodeStyle = (
  courseCode: string,
  plannedCourses: Record<string, PlannerCourse>,
  theme: string
) => {
  // If planned, keep default styling. Otherwise apply lockedNode styling.
  if (plannedCourses[courseCode]) return sameNode(courseCode);
  return { ...sameNode(courseCode), ...lockedNode(theme) };
};

const mapNodeOpacity = (courseCode: string, opacity: number) => {
  return {
    id: courseCode,
    label: courseCode,
    style: {
      opacity
    },
    labelCfg: {
      style: {
        opacity
      }
    }
  };
};

const edgeOpacity = (id: string, opacity: number) => {
  return {
    id,
    style: {
      opacity
    }
  };
};

const nodeLabelHoverStyle = (courseCode: string) => {
  return {
    id: courseCode,
    label: courseCode,
    labelCfg: {
      style: {
        fill: '#fff'
      }
    }
  };
};

const nodeLabelUnhoverStyle = (
  courseCode: string,
  plannedCourses: Record<string, PlannerCourse>,
  theme: string
) => {
  if (plannedCourses[courseCode]) {
    // uses default node style with label color changed
    return {
      id: courseCode,
      label: courseCode,
      labelCfg: {
        style: {
          fill: '#fff'
        }
      }
    };
  }
  return {
    id: courseCode,
    label: courseCode,
    labelCfg: {
      style: {
        fill: theme === 'light' ? '#9254de' : '#d7b7fd'
      }
    }
  };
};

export {
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
};
