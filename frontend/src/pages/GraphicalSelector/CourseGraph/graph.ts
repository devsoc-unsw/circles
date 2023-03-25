import type { Arrow } from '@antv/g6';
import { PlannerCourse } from 'types/planner';

const defaultNode = {
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

// plannedCourses is an object of with keys of courseCodes
const mapNodeStyle = (
  courseCode: string,
  plannedCourses: Record<string, PlannerCourse>,
  theme: string
) => {
  // determine if planned or unplanned
  if (plannedCourses[courseCode]) {
    // uses default node style
    return { id: courseCode, label: courseCode };
  }
  return {
    id: courseCode,
    label: courseCode,
    style: {
      fill: theme === 'light' ? '#fff' : '#000',
      stroke: theme === 'light' ? '#9254de' : '#d7b7fd'
    },
    labelCfg: {
      style: {
        fill: theme === 'light' ? '#9254de' : '#d7b7fd'
      }
    }
  };
};

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
  defaultNode,
  mapNodeStyle,
  nodeLabelHoverStyle,
  nodeLabelUnhoverStyle,
  nodeStateStyles
};
