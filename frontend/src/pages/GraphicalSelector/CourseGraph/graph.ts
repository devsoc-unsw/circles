import type { Arrow } from '@antv/g6';
import { CourseValidation } from 'types/courses';
import { PlannerCourse } from 'types/planner';

const plannedNode = {
  size: 70,
  style: {
    fill: '#9254de',
    stroke: '#9254de',
    cursor: 'pointer',
    lineWidth: 1
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
    stroke: theme === 'light' ? '#9254de' : '#d7b7fd',
    lineWidth: 1
  },
  labelCfg: {
    style: {
      fill: theme === 'light' ? '#9254de' : '#d7b7fd'
    }
  }
});

const unlockedNode = (theme: string) => ({
  style: {
    fill: theme === 'light' ? '#fbefff' : '#381f56',
    stroke: theme === 'light' ? '#9254de' : '#d7b7fd',
    lineWidth: 1
  },
  labelCfg: {
    style: {
      fill: theme === 'light' ? '#9254de' : '#d7b7fd'
    }
  }
});

const prereqNode = (theme: string) => ({
  style: {
    stroke: theme === 'light' ? '#000' : '#fff',
    lineWidth: 2
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

const plannedLabel = {
  labelCfg: {
    style: {
      fill: '#fff'
    }
  }
};

const lockedLabel = (theme: string) => ({
  labelCfg: {
    style: {
      fill: theme === 'light' ? '#9254de' : '#d7b7fd'
    }
  }
});

const nodeLabelHoverStyle = (courseCode: string) => ({
  ...sameNode(courseCode),
  ...plannedLabel
});

const nodeLabelUnhoverStyle = (
  courseCode: string,
  plannedCourses: Record<string, PlannerCourse>,
  theme: string
) => {
  if (plannedCourses[courseCode]) {
    return {
      ...sameNode(courseCode),
      ...plannedLabel
    };
  }
  return {
    ...sameNode(courseCode),
    ...lockedLabel(theme)
  };
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

const edgeOutHoverStyle = (arrow: typeof Arrow, theme: string, id: string) => ({
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

const edgeInHoverStyle = (arrow: typeof Arrow, theme: string, id: string) => ({
  id,
  style: {
    endArrow: {
      path: arrow.triangle(5, 5, 30),
      fill: theme === 'light' ? '#000' : '#fff',
      d: 25
    },
    stroke: theme === 'light' ? '#000' : '#fff'
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
  courses: Record<string, CourseValidation>,
  theme: string
) => {
  const isPlanned = plannedCourses[courseCode];
  const isUnlocked = courses[courseCode]?.unlocked;

  if (isPlanned) return { ...sameNode(courseCode), ...plannedNode };
  if (isUnlocked) return { ...sameNode(courseCode), ...unlockedNode(theme) };
  return { ...sameNode(courseCode), ...lockedNode(theme) };
};

const mapNodePrereq = (courseCode: string, theme: string) => {
  return {
    ...sameNode(courseCode),
    ...prereqNode(theme)
  };
};

const mapNodeOpacity = (courseCode: string, opacity: number) => {
  return {
    ...sameNode(courseCode),
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

const mapEdgeOpacity = (id: string, opacity: number) => ({
  id,
  style: {
    opacity
  }
});

export {
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
};
