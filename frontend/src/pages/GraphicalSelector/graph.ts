import type { Arrow } from '@antv/g6';
import { PlannerCourse } from 'types/planner';

export const defaultNode = {
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

export const defaultEdge = (arrow: typeof Arrow) => ({
  style: {
    endArrow: {
      path: arrow.triangle(5, 5, 30),
      fill: '#e0e0e0',
      d: 25
    }
  }
});

// plannedCourses is an object of with keys of courseCodes
export const mapNodeStyle = (courseCode: string, plannedCourses: Record<string, PlannerCourse>) => {
  // determine if planned or unplanned
  if (plannedCourses[courseCode]) {
    // uses default node style
    return { id: courseCode, label: courseCode };
  }
  return {
    id: courseCode,
    label: courseCode,
    style: {
      fill: '#fff',
      stroke: '#9254de'
    },
    labelCfg: {
      style: {
        fill: '#9254de'
      }
    }
  };
};

export const nodeStateStyles = {
  hover: {
    fill: '#b37feb',
    stroke: '#b37feb'
  },
  click: {
    fill: '#b37feb',
    stroke: '#b37feb'
  }
};
